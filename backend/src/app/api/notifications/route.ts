import { Router } from "express";
import { getNotifications, deleteAllNotifications } from "./notifications";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Proteksi rute: Harus login dan harus CUSTOMER
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized: Customer only" });
    }
    next();
};

router.get("/", authenticate, isCustomer, getNotifications);
router.delete("/", authenticate, isCustomer, deleteAllNotifications);

export default router;


// // app/api/notifications/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from "@/lib/auth"
// import { prisma } from '@/lib/prisma';

// export async function GET(req: NextRequest) {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const notifications = await prisma.notification.findMany({
//             where: { userId: session.user.id },
//             orderBy: { createdAt: 'desc' },
//         });
//         return NextResponse.json(notifications);
//     } catch (error) {
//         console.error("Error fetching notifications:", error);
//         return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
//     }
// }

// export async function DELETE(req: NextRequest) {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         // Hapus semua notifikasi user
//         await prisma.notification.deleteMany({
//             where: { userId: session.user.id },
//         });
        
//         return NextResponse.json({ message: "All notifications marked as read" });
//     } catch (error) {
//         console.error("Error deleting notifications:", error);
//         return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
//     }
// }