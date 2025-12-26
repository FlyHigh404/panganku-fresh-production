import { Router } from "express";
import { getPrimaryAddress } from "./address-primary";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Middleware pengecekan role
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized" });
    }
    next();
};

router.get("/address-primary", authenticate, isCustomer, getPrimaryAddress);

export default router;

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"

// export async function GET() {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     try {
//         const primaryAddress = await prisma.address.findFirst({
//             where: {
//                 userId: session.user.id,
//                 isPrimary: true,
//             },
//         });
//         return NextResponse.json(primaryAddress || null);
//     } catch (error) {
//         console.error("Error fetching primary address:", error);
//         return NextResponse.json({ error: "Failed to fetch primary address" }, { status: 500 });
//     }
// }