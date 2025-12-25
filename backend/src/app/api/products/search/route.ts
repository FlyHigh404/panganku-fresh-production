import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const q = searchParams.get("q") || ""
    const categoryId = searchParams.get("categoryId") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const minRating = searchParams.get("minRating")

    const skip = (page - 1) * limit

    const priceFilter: any = {}
    if (minPrice) priceFilter.gte = Number(minPrice)
    if (maxPrice) priceFilter.lte = Number(maxPrice)

    const whereClause: any = {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
        (minPrice || maxPrice) ? { price: priceFilter } : {},
      ],
    }


    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: { 
          category: true,
          ratings: { 
            select: {
              value: true 
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where: whereClause }),
    ])

    // HITUNG AVERAGE RATING 
    const productsWithRating = products.map(product => {
      const ratingValues = product.ratings.map(rating => rating.value)
      const averageRating = ratingValues.length > 0 
        ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length 
        : 0

      return {
        ...product,
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: ratingValues.length
      }
    })

    let finalProducts = productsWithRating
    if (minRating) {
      const minRatingNum = Number(minRating)
      finalProducts = productsWithRating.filter(product => 
        product.averageRating >= minRatingNum
      )
    }

    return NextResponse.json({
      data: finalProducts,
      meta: {
        total: finalProducts.length,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}