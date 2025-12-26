import { Response } from "express";
import { prisma } from "../../../../../lib/prisma";
import { AuthRequest } from "../../../middleware/auth.middleware";

// GET Detail Order berdasarkan ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                orderItems: true, // Mengambil detail item dalam pesanan
            },
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// PATCH Update Status Order
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const { status } = req.body;

        // Validasi enum status sesuai dengan logika Next.js Anda
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
                user: {
                    include: {
                        Address: true // Sertakan alamat untuk keperluan pengiriman/invoice
                    }
                },
                orderItems: {
                    include: {
                        product: true // Sertakan data produk lengkap
                    }
                }
            }
        });

        return res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ error: "Failed to update order" });
    }
};