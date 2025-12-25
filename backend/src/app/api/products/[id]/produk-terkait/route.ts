// api/products/[id]/produk-terkait/route.ts

import {NextRequest, NextResponse} from "next/server";
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const categoryId = req.nextUrl.searchParams.get("categoryId");

    if (!categoryId) {
        return NextResponse.json({ error: "categoryId query parameter is required" }, { status: 400 });
    }

    try {
        const relatedProducts = await prisma.product.findMany({
            where: {
                categoryId: categoryId,
                id: { not: id },
            },
            take: 10,
        });
        return NextResponse.json(relatedProducts);
    } catch (error) {
        console.error("Error fetching related products:", error);
        return NextResponse.json({ error: "Failed to fetch related products" }, { status: 500 });
    }
}