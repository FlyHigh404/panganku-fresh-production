import { Request, Response } from "express";
import { prisma } from "../../../../lib/prisma";

export const handlePaymentNotification = async (req: Request, res: Response) => {
    try {
        const { order_id, transaction_status } = req.body;

        console.log("📩 Midtrans Notification:", transaction_status);

        let newStatus = "PENDING";

        if (transaction_status === "capture" || transaction_status === "settlement") {
            const order = await prisma.order.findUnique({
                where: { id: order_id },
            });

            if (!order) {
                return res.status(404).json({ error: "Order not found" });
            }

            newStatus = "PROCESSING";

            // Menggunakan Transaction untuk integritas data
            await prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order_id },
                    data: { status: "PROCESSING" },
                });

                // Update stok produk secara otomatis
                const orderItems = await tx.orderItem.findMany({
                    where: { orderId: order_id },
                });

                for (const item of orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }
            });
        } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
            newStatus = "CANCELED";
            await prisma.order.update({
                where: { id: order_id },
                data: { status: "CANCELED" },
            });
        } else if (transaction_status === "pending") {
            newStatus = "PENDING";
            await prisma.order.update({
                where: { id: order_id },
                data: { status: "PENDING" },
            });
        }

        // Mengirim event ke server WebSocket untuk update UI real-time di sisi client
        try {
            await fetch(`${process.env.WS_SERVER_URL || 'http://localhost:4000'}/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: order_id,
                    status: newStatus,
                }),
            });
        } catch (wsError) {
            console.warn("WebSocket notification failed, but DB updated.");
        }

        console.log(`📡 Order ${order_id} → ${newStatus}`);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("❌ Error handling notification:", error);
        return res.status(500).json({ error: "Failed to handle notification" });
    }
};