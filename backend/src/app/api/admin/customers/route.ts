import { Router } from "express";
import { getAllCustomers } from "./customers";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/customers", getAllCustomers);

export default router;

// import { NextResponse, NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth"

// export async function GET(req: NextRequest) {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user?.role !== "ADMIN") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     try {
//         const customers = await prisma.user.findMany({
//             where: {
//                 role: { not: "ADMIN" }, // Assuming you want to fetch only non-admin users
//             },
//             include: {
//                 orders: true,
//                 Address: true
//             },
//         });

//         return NextResponse.json(customers);
//     } catch (error) {
//         console.error("Error fetching customers:", error);
//         return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
//     }
// }