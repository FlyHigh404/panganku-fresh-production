import { prisma } from "../../../../../lib/prisma";
import { Request, Response } from "express";

export const getRelatedProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ID produk saat ini
    const categoryId = req.query.categoryId as string; // ID kategori dari query string

    if (!categoryId) {
      return res.status(400).json({ error: "categoryId query parameter is required" });
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        id: { not: id }, // Kecualikan produk yang sedang dilihat
      },
      take: 10, // Ambil maksimal 10 produk
    });

    return res.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res.status(500).json({ error: "Failed to fetch related products" });
  }
};