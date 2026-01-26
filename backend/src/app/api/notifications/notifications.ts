import { Response } from "express";
import { prisma } from "../../../lib/prisma";

export const getNotifications = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: User ID missing" });
    }    

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const deleteAllNotifications = async (req: any, res: Response) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });
    
    return res.json({ message: "All notifications marked as read/deleted" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return res.status(500).json({ error: "Failed to delete notifications" });
  }
};