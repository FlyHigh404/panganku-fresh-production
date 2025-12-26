import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getAdminCategories, createCategory } from "./admin-categories";

const router = Router();

// Middleware khusus pengecekan role ADMIN
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/categories", getAdminCategories);
router.post("/categories", createCategory);

export default router;

// // api/admin/categories/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// // api/categories
// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { name, description } = await req.json();

//     const newCategory = await prisma.category.create({
//       data: {
//         name,
//         description,
//       },
//     });

//     return NextResponse.json(newCategory, { status: 201 });
//   } catch (error) {
//     console.error("Error creating category:", error);
//     return NextResponse.json(
//       { error: "Failed to create category" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user?.role || session.user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     // Fetch categories with product count
//     const categories = await prisma.category.findMany({
//       include: {
//         _count: {
//           select: { products: true }
//         }
//       }
//     });

//     // Transform the response to include productCount
//     const categoriesWithCount = categories.map(category => ({
//       id: category.id,
//       name: category.name,
//       description: category.description,
//       productCount: category._count.products
//     }));

//     return NextResponse.json(categoriesWithCount);
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch categories" },
//       { status: 500 }
//     );
//   }
// }