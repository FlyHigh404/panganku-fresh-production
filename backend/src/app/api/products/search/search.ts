import { Request, Response } from "express";
import { prisma } from "../../../../lib/prisma";

export const searchProducts = async (req: Request, res: Response) => {
  try {
    // Ambil parameter dari query string Express
    const q = (req.query.q as string) || "";
    const categoryId = (req.query.categoryId as string) || "";
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const minPrice = req.query.minPrice as string;
    const maxPrice = req.query.maxPrice as string;
    const minRating = req.query.minRating as string;

    const skip = (page - 1) * limit;

    // Build filter harga
    const priceFilter: any = {};
    if (minPrice) priceFilter.gte = Number(minPrice);
    if (maxPrice) priceFilter.lte = Number(maxPrice);

    // Build whereClause
    const whereClause: any = {
      AND: [
        q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        } : {},
        categoryId ? { categoryId } : {},
        (minPrice || maxPrice) ? { price: priceFilter } : {},
      ],
    };

    // Eksekusi kueri secara paralel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          ratings: { select: { value: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Hitung Average Rating secara manual
    const productsWithRating = products.map((product) => {
      const ratingValues = product.ratings.map((r) => r.value);
      const averageRating = ratingValues.length > 0 
        ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length 
        : 0;

      return {
        ...product,
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: ratingValues.length,
      };
    });

    // Filter berdasarkan rating jika ada
    let finalProducts = productsWithRating;
    if (minRating) {
      const minRatingNum = Number(minRating);
      finalProducts = productsWithRating.filter(
        (product) => product.averageRating >= minRatingNum
      );
    }

    return res.json({
      data: finalProducts,
      meta: {
        total: total, // Menggunakan total asli dari count database
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};