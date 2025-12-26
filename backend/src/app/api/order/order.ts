import { Response } from "express";
import { prisma } from "../../../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity } = req.body;

    // 1. Validasi Input
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // 2. Ambil data produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true, stock: true, name: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Cek Stok
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock for ${product.name}` 
      });
    }

    const totalAmount = Number(product.price) * Number(quantity);

    // 4. Transaksi Database Atomic
    const order = await prisma.$transaction(async (tx) => {
      // Buat order utama
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          totalAmount,
          status: "PENDING",
        },
      });

      // Buat detail item order
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: product.id,
          quantity,
          unitPrice: product.price,
        },
      });

      return newOrder;
    });

    return res.status(201).json({ 
      message: "Order created successfully", 
      order 
    });

  } catch (error) {
    console.error("Order error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};