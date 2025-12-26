import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET All Admin Notifications
export const getAdminNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
            }
        });

        return res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Failed to fetch notifications" });
    }
};