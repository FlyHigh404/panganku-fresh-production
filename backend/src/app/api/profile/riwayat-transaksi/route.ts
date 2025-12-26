import { Router } from "express";
import { getOrderHistory } from "./riwayat";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Middleware pengecekan role CUSTOMER
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized: Customer only" });
    }
    next();
};

// URL: /app/api/order
router.get("/riwayat-transaksi", authenticate, isCustomer, getOrderHistory);

export default router;

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"
// import { NextResponse } from "next/server";

// export async function GET() {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     try {
//         const orders = await prisma.order.findMany({
//             where: {
//                 userId: session.user.id,
//                 NOT: { status: "PENDING" },
//             },
//             include: {
//                 orderItems: { include: { product: true } },
//                 user: true,
//             },
//             orderBy: { createdAt: 'desc' },
//         });

//         return NextResponse.json(orders);
//     } catch (error) {
//         console.error("Error fetching orders:", error);
//         return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
//     }
// }