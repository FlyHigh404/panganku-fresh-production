import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

// GET All Products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc' // Opsional: Menampilkan produk terbaru di atas
      }
    });
    return res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};