import { Response } from "express";
import { prisma } from "../../../../../lib/prisma";
import { AuthRequest } from "../../../middleware/auth.middleware";

// GET Order Detail by ID (Admin)
export const getAdminOrderById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        phone: true,
                        Address: {
                            where: { isPrimary: true },
                            select: { fullAddress: true },
                        },
                    },
                },
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        return res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({ error: 'Failed to fetch order' });
    }
};

// PATCH Update Order Status & Notify (Admin)
export const updateOrderStatusAdmin = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const { status } = req.body;
        const allowedStatuses = ['PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELED'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            },
            include: {
                user: { include: { Address: true } },
                orderItems: { include: { product: true } }
            }
        });

        // 1. Simpan Notifikasi ke Database untuk User
        const message = `Your order ${id} status has been updated to ${status}`;
        const notification = await prisma.notification.create({
            data: {
                userId: updatedOrder.user.id,
                message,
            },
        });

        // 2. Trigger Real-time Notification via WebSocket Server (Opsional)
        if (process.env.WS_SERVER_URL) {
            try {
                await fetch(`${process.env.WS_SERVER_URL}/notify/order`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: updatedOrder.user.id,
                        notification,
                    }),
                });
            } catch (wsError) {
                console.warn("WebSocket server unreachable, but notification saved to DB.");
            }
        }

        return res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ error: "Failed to update order" });
    }
};