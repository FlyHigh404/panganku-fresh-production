import { Router } from "express";
import { getProductRatings, upsertProductRating, deleteProductRating } from "./ratings";
import { authenticate } from "@/app/api/middleware/auth.middleware";

const router = Router();

router.get("/:id/ratings", getProductRatings);
router.post("/:id/ratings", authenticate, upsertProductRating);
router.delete("/:id/ratings", authenticate, deleteProductRating);

export default router;
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"

// // GET ratings by productId + average
// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   try {
//     const ratings = await prisma.rating.findMany({
//       where: { productId: id },
//       include: {
//         user: { select: { id: true, name: true, image: true } },
//       },
//     });

//     const average =
//       ratings.length > 0
//         ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
//         : 0;

//     return NextResponse.json({ ratings, average });
//   } catch (error) {
//     console.error("Error fetching ratings:", error);
//     return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
//   }
// }

// // POST/UPSERT rating
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
//     const { value } = await req.json();
//     if (!value || value < 1 || value > 5) {
//       return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
//     }

//     const rating = await prisma.rating.upsert({
//       where: {
//         // make unique key manually
//         productId_userId: {
//           productId: id,
//           userId: session.user.id,
//         },
//       },
//       update: { value },
//       create: {
//         value,
//         productId: id,
//         userId: session.user.id,
//       },
//     });

//     return NextResponse.json(rating, { status: 201 });
//   } catch (error) {
//     console.error("Error creating rating:", error);
//     return NextResponse.json({ error: "Failed to create rating" }, { status: 500 });
//   }
// }

// // PUT rating
// export async function PUT(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;


//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== "CUSTOMER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { value } = await req.json();
//     if (!value || value < 1 || value > 5) {
//       return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
//     }

//     const rating = await prisma.rating.update({
//       where: {
//         productId_userId: {
//           productId: id,
//           userId: session.user.id,
//         },
//       },
//       data: { value },
//     });

//     return NextResponse.json(rating);
//   } catch (error) {
//     console.error("Error updating rating:", error);
//     return NextResponse.json({ error: "Failed to update rating" }, { status: 500 });
//   }
// }

// // DELETE rating
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
//     await prisma.rating.delete({
//       where: {
//         productId_userId: {
//           productId: id,
//           userId: session.user.id,
//         },
//       },
//     });

//     return NextResponse.json({ message: "Rating deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting rating:", error);
//     return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 });
//   }
// }

