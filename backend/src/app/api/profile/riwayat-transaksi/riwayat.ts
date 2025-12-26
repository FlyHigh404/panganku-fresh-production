import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET Transaction History for Profile
export const getOrderHistory = async (req: AuthRequest, res: Response) => {
    try {
        // req.user.id berasal dari middleware authenticate
        const orders = await prisma.order.findMany({
            where: {
                userId: req.user!.id,
                NOT: { status: "PENDING" }, // Mengabaikan order yang belum selesai checkout
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                user: true, // Menyertakan data user sesuai kode asli Anda
            },
            orderBy: { createdAt: 'desc' }, // Terbaru ke terlama
        });

        return res.json(orders);
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return res.status(500).json({ error: "Failed to fetch orders" });
    }
};