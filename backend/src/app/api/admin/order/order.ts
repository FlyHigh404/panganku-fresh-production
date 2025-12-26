import { Response } from "express";
import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET All Orders (Admin View)
export const getAllOrdersAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                // Mengambil data user yang melakukan pemesanan
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
        });

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
};