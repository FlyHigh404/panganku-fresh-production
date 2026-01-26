import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getAdminProducts, createProduct } from "./products";

const router = Router()

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/products", getAdminProducts);
router.post("/products", createProduct);

export default router;

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth"


// export async function POST(request: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || session.user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { name, description, price, stock, categoryId, imageUrl } =
//       await request.json();

//     // Validate required fields
//     if (!name || !price || !stock || !categoryId || !imageUrl || imageUrl.length === 0) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const newProduct = await prisma.product.create({
//       data: {
//         name,
//         description: description || "",
//         price: parseFloat(price),
//         stock: parseInt(stock),
//         categoryId,
//         imageUrl, 
//       },
//       include: {
//         category: true,
//       },
//     });

//     return NextResponse.json(newProduct, { status: 201 });
//   } catch (error) {
//     console.error("Error creating product:", error);
//     return NextResponse.json(
//       { error: "Failed to create product" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const products = await prisma.product.findMany({
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         price: true,
//         stock: true,
//         imageUrl: true,
//         category: {
//           select: {
//             id: true, 
//             name: true,
//           },
//         },
//       }
//     });
//     return NextResponse.json(products);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch products" },
//       { status: 500 }
//     );
//   }
// }
