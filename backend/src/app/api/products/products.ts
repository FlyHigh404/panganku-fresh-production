import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";

export const getBestSellers = async (req: Request, res: Response) => {
  try {
    // Menggunakan queryRaw yang sama dari kode Next.js Anda
    const bestSellers = await prisma.$queryRaw<any[]>`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p."imageUrl",
        p."categoryId",
        c.name as "categoryName",
        COALESCE(SUM(oi.quantity), 0)::int AS "totalSold",
        COALESCE(AVG(r.value), 0)::float AS "averageRating"
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
      LEFT JOIN "Order" o ON oi."orderId" = o.id AND o.status = 'COMPLETED'
      LEFT JOIN "Rating" r ON p.id = r."productId"
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      GROUP BY p.id, c.id, c.name
      ORDER BY "totalSold" DESC
      LIMIT 3;
    `;

    return res.json(bestSellers);
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return res.status(500).json({ error: "Failed to fetch best sellers" });
  }
};