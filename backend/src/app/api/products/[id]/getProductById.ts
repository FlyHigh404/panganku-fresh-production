import { prisma } from "@/lib/prisma";
import { Request, Response } from "express";

// Ambil detail produk berdasarkan ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Mengambil :id dari URL

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};