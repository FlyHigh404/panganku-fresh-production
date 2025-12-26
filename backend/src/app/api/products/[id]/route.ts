import { Router } from "express";
import { getProductById } from "./getProductById";

const router = Router()

router.get('/:id', getProductById)

export default router;

// import { NextResponse, NextRequest} from "next/server";
// import { prisma } from "@/lib/prisma"

// export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

//   const { id } = await params;

//   try {
//     const product = await prisma.product.findUnique({
//       where: { id },
//       include: {
//         category: true,
//       },
//     });

//     if (!product) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json(product);
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
//   }
// }