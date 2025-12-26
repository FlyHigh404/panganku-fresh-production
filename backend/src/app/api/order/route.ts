import { Router } from "express";
import { createOrder } from "@/app/api/order/order";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Middleware pengecekan CUSTOMER
const isCustomer = (req: any, res: any, next: any) => {
  if (req.user.role !== "CUSTOMER") {
    return res.status(403).json({ error: "Unauthorized: Customer only" });
  }
  next();
};

// Route: /app/api/order
router.post("/", authenticate, isCustomer, createOrder);

export default router;

// // regarmart-ecommerce/src/app/api/order/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { authOptions } from "@/lib/auth"
// import { getServerSession } from "next-auth/next";
// import { prisma } from "@/lib/prisma"

// export async function POST(request: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session || session.user.role !== "CUSTOMER") {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { productId, quantity } = await request.json();

//     if (!productId || !quantity || quantity <= 0) {
//       return NextResponse.json(
//         { message: "Invalid request data" },
//         { status: 400 }
//       );
//     }

//     // Ambil data produk
//     const product = await prisma.product.findUnique({
//       where: { id: productId },
//       select: { id: true, price: true, stock: true, name: true },
//     });

//     if (!product) {
//       return NextResponse.json({ message: "Product not found" }, { status: 404 });
//     }

//     if (product.stock < quantity) {
//       return NextResponse.json(
//         { message: `Insufficient stock for ${product.name}` },
//         { status: 400 }
//       );
//     }

//     const totalAmount = Number(product.price) * Number(quantity);

//     // Transaksi biar atomic
//     const order = await prisma.$transaction(async (tx) => {
//       // Buat order
//       const newOrder = await tx.order.create({
//         data: {
//           userId: session.user.id,
//           totalAmount,
//           status: "PENDING",
//         },
//       });

//       // Buat order item
//       await tx.orderItem.create({
//         data: {
//           orderId: newOrder.id,
//           productId: product.id,
//           quantity,
//           unitPrice: product.price,
//         },
//       });

//       return newOrder;
//     });

//     return NextResponse.json(
//       { message: "Order created successfully", order },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Checkout error:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
