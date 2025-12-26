import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware";
import { getProductReviews, addProductReview, deleteProductReview } from "./reviews";

const router = Router();

router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", authenticate, addProductReview);
router.delete(":id/reviews", authenticate, deleteProductReview);

// // src/app/api/products/[id]/reviews/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"
// // GET reviews by productId
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {

//   const { id } = await params;
//   try {
//     const reviews = await prisma.review.findMany({
//       where: { productId: id },
//       include: {
//         user: { select: { id: true, name: true, image: true } },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(reviews);
//   } catch (error) {
//     console.error("Error fetching reviews:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch reviews" },
//       { status: 500 }
//     );
//   }
// }

// // POST add review
// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== "CUSTOMER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { content } = await req.json();
//     if (!content) {
//       return NextResponse.json({ error: "Content required" }, { status: 400 });
//     }

//     const newReview = await prisma.review.create({
//       data: {
//         content,
//         productId: id,
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json(newReview, { status: 201 });
//   } catch (error) {
//     console.error("Error creating review:", error);
//     return NextResponse.json(
//       { error: "Failed to create review" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== "CUSTOMER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   try {
//     const review = await prisma.review.delete({
//       where: {
//         id: id,
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json(review, { status: 200 });
//   } catch (error) {
//     console.error("Error deleting review:", error);
//     return NextResponse.json(
//       { error: "Failed to delete review" },
//       { status: 500 }
//     );
//   }
// }
