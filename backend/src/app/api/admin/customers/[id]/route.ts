import { Router } from "express";
import { getCustomerById } from "./customersById";
import { authenticate } from "@/app/api/middleware/auth.middleware";

const router = Router();

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/customers/:id", getCustomerById);

export default router;


// import { authOptions } from "@/lib/auth"
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";

// export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== 'ADMIN') {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   // ✅ await params sebelum digunakan
//   const { id } = await context.params;

//   try {
//     const customer = await prisma.user.findUnique({
//       where: { id },
//       include: {
//         orders: {
//           include: { orderItems: {
//             include: {
//                 product: true
//             }
//           } },
//         },
//       },
//     });

//     if (!customer) {
//       return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
//     }

//     return NextResponse.json(customer);
//   } catch (error) {
//     console.error("Error fetching customer:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
