import { getCategories } from "./categories";
import { Router } from "express";

const router = Router()
router.get('/categories', getCategories)

export default router;
// import { NextResponse, NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma"


// export async function GET(req: NextRequest) {
//   try {
//     const kategori = await prisma.category.findMany();
//     return NextResponse.json(kategori);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch categories" },
//       { status: 500 }
//     );
//   }
// }
