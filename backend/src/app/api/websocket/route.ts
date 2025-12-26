import { Router } from "express";
import { Server } from "socket.io";

export const createNotifyRouter = (io: Server) => {
    const router = Router();

    // POST /notify/order (Trigger dari Midtrans/Admin)
    router.post("/order", (req, res) => {
        const { orderId, status } = req.body;

        // Broadcast ke room spesifik
        io.to(`order_${orderId}`).emit("order:update", { orderId, status });

        console.log(`📡 Broadcast Order Update: ${orderId} -> ${status}`);
        return res.json({ success: true });
    });

    // POST /notify/reply (Trigger dari Admin Reply Review)
    router.post("/reply", (req, res) => {
        const { userId, notification } = req.body;

        // Kirim notifikasi ke user spesifik
        io.to(`user_${userId}`).emit("notification:new", notification);

        console.log(`📡 Broadcast Notification to User: ${userId}`);
        return res.json({ success: true });
    });

    return router;
};