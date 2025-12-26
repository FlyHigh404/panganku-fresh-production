import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET History Order berdasarkan User ID
export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        // req.user.id didapat dari middleware authenticate
        const orders = await prisma.order.findMany({
            where: {
                userId: req.user!.id,
                NOT: { status: "PENDING" }, // Hanya mengambil order yang sudah masuk proses/bayar
            },
            include: {
                orderItems: {
                    include: {
                        product: true, // Sertakan info produk (nama, gambar, dll)
                    },
                },
            },
            orderBy: { createdAt: "desc" }, // Pesanan terbaru di paling atas
        });

        return res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ error: "Failed to fetch orders" });
    }
};