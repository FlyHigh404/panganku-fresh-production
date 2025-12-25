// api/admin/reply-review/route.ts

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reviewId, replyText } = await req.json();
    const adminId = session.user.id;

    // Cek review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Update review (admin reply)
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reply: replyText,
        replyBy: adminId,
      },
    });

    // Simpan notifikasi ke DB
    const notif = await prisma.notification.create({
      data: {
        userId: review.userId,
        message: `Admin telah membalas ulasanmu: "${replyText}"`,
      },
    });

    // Kirim event ke server websocket (optional kalau online)
    await fetch(`${process.env.WS_SERVER_URL}/notify/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: review.userId,
        notification: notif,
      }),
    });

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error) {
    console.error("Error replying to review:", error);
    return NextResponse.json(
      { error: "Failed to reply to review" },
      { status: 500 }
    );
  }
}
