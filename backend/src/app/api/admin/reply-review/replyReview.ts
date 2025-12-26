import { Response } from "express";
import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

export const replyToReview = async (req: AuthRequest, res: Response) => {
    try {
        const { reviewId, replyText } = req.body;
        const adminId = req.user!.id;

        if (!reviewId || !replyText) {
            return res.status(400).json({ error: "Review ID and reply text are required" });
        }

        // 1. Cek keberadaan review
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            select: { id: true, userId: true },
        });

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        // 2. Update review (tambahkan balasan admin)
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                reply: replyText,
                replyBy: adminId,
            },
        });

        // 3. Simpan notifikasi ke Database untuk User
        const notif = await prisma.notification.create({
            data: {
                userId: review.userId,
                message: `Admin telah membalas ulasanmu: "${replyText}"`,
            },
        });

        // 4. Kirim event ke server WebSocket (Real-time)
        if (process.env.WS_SERVER_URL) {
            try {
                await fetch(`${process.env.WS_SERVER_URL}/notify/reply`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: review.userId,
                        notification: notif,
                    }),
                });
            } catch (wsError) {
                console.warn("WebSocket server unreachable, but notification saved to DB.");
            }
        }

        return res.status(200).json(updatedReview);
    } catch (error) {
        console.error("Error replying to review:", error);
        return res.status(500).json({ error: "Failed to reply to review" });
    }
};