import { Router } from "express";
import { getCart, addToCart, updateCartItem, deleteCartItem } from "../../../api/cart/cart";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Middleware pengecekan role CUSTOMER
const isCustomer = (req: any, res: any, next: any) => {
  if (req.user.role !== "CUSTOMER") {
    return res.status(403).json({ error: "Unauthorized: Customer only" });
  }
  next();
};

// Route utama (/app/api/cart)
router.get("/", authenticate, isCustomer, getCart);
router.post("/", authenticate, isCustomer, addToCart);

// Route dengan parameter ID (/app/api/cart/:itemId)
router.put("/:itemId", authenticate, isCustomer, updateCartItem);
router.delete("/:itemId", authenticate, isCustomer, deleteCartItem);

export default router;

// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { authOptions } from "@/lib/auth"

// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ itemId: string }> }
// ) {
//   const { itemId } = await params;

//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== "CUSTOMER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await prisma.orderItem.delete({
//       where: { id: itemId },
//     });
//     return NextResponse.json({ message: "Item removed" });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
//   }
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ itemId: string }> }
// ) {
//   const { itemId } = await params;

//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== "CUSTOMER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { quantity } = await req.json(); // Get quantity from the request body

//     if (quantity <= 0) {
//       return NextResponse.json({ error: "Quantity must be greater than 0" }, { status: 400 });
//     }

//     // Update the cart item quantity
//     const updatedItem = await prisma.orderItem.update({
//       where: { id: itemId },
//       data: { quantity },
//     });

//     return NextResponse.json({ message: "Item updated", item: updatedItem });
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
//   }
// }