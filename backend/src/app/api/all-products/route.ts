import { Router } from "express";
import { getAllProducts } from "./all-products";

const router = Router();

router.get("/", getAllProducts);

export default router;

// import { prisma } from "@/lib/prisma"
// import {NextResponse} from "next/server";

// export async function GET() {
//     try {
//         const products = await prisma.product.findMany();
//         return NextResponse.json(products);
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         return NextResponse.json({error: "Failed to fetch products"}, {status: 500});
//     }
// }