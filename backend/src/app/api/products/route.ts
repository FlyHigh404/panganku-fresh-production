import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const bestSellers = await prisma.$queryRaw<
      {
        id: string;
        name: string;
        description: string | null;
        price: number;
        stock: number;
        imageUrl: string[];
        categoryId: string;
        categoryName: string; // Ambil nama category dari join
        totalSold: number;
        averageRating: number;
      }[]
    >`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p."imageUrl",
        p."categoryId",
        c.name as "categoryName", -- Ambil nama category dari tabel Category
        COALESCE(SUM(oi.quantity), 0)::int AS "totalSold",
        COALESCE(AVG(r.value), 0)::float AS "averageRating"
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
      LEFT JOIN "Order" o ON oi."orderId" = o.id AND o.status = 'COMPLETED'
      LEFT JOIN "Rating" r ON p.id = r."productId"
      LEFT JOIN "Category" c ON p."categoryId" = c.id -- JOIN dengan tabel Category
      GROUP BY p.id, c.id, c.name
      ORDER BY "totalSold" DESC
      LIMIT 3;
    `;

    return NextResponse.json(bestSellers);
  } catch (error) {
    console.error("Error fetching best sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch best sellers" },
      { status: 500 }
    );
  }
}
