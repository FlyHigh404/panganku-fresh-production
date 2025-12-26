import { Router } from "express";
import { getMyOrders } from "./order";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Middleware Role Guard
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized: Customer only" });
    }
    next();
};

router.get("/order", authenticate, isCustomer, getMyOrders);

export default router;

// import {NextResponse} from "next/server";
// import {getServerSession} from "next-auth";
// import { prisma } from "@/lib/prisma"
// import { authOptions } from "@/lib/auth"

// export async function GET() {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({error: "Unauthorized"}, {status: 401});
//     }
//     try {
//         const orders = await prisma.order.findMany({
//             where: {
//             userId: session.user.id,
//             NOT: { status: "PENDING" }
//             },
//             include: {
//             orderItems: { include: { product: true } },
//             },
//             orderBy: { createdAt: 'desc' },
//         });
//         return NextResponse.json(orders);
//     } catch (error) {
//         console.error("Error fetching orders:", error);
//         return NextResponse.json({error: "Failed to fetch orders"}, {status: 500});
//     }
// }