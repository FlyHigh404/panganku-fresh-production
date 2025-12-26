import { Router } from "express";
import { authenticate } from "@/app/api/middleware/auth.middleware";
import { 
  updateCategory,
  deleteCategory 
} from "@/app/api/admin/categories/[id]/categoriesById";

const router = Router();

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

export default router;

// import { prisma } from "@/lib/prisma";
// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await getServerSession(authOptions);
//   const { id } = await params;

//   if (!session || session.user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { name, description, imageUrl } = await req.json();

//     const updatedImageUrl = imageUrl ? imageUrl : null;

//     const updatedCategory = await prisma.category.update({
//       where: { id },
//       data: {
//         name,
//         description,
//         imageUrl: updatedImageUrl,
//       },
//     });

//     return NextResponse.json(updatedCategory);
//   } catch (error) {
//     console.error("Error updating category:", error);
//     return NextResponse.json(
//       { error: "Failed to update category" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const session = await getServerSession(authOptions);
//   const { id } = await params;

//   if (!session || session.user?.role !== "ADMIN") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await prisma.category.delete({
//       where: { id },
//     });

//     return NextResponse.json({ message: "Category deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting category:", error);
//     return NextResponse.json(
//       { error: "Failed to delete category" },
//       { status: 500 }
//     );
//   }
// }
