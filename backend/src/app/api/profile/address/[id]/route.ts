import { Router } from "express";
import { updateAddress, deleteAddress } from "./addressById";
import { authenticate } from "../../../../api/middleware/auth.middleware";

const router = Router();

// Middleware Role Guard
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized: Customer only" });
    }
    next();
};

router.put("/address/:id", authenticate, isCustomer, updateAddress);
router.delete("/address/:id", authenticate, isCustomer, deleteAddress);

export default router;

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"

// // PUT -> update alamat
// export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user?.id) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const { label, fullAddress, recipientName, phoneNumber, note, isPrimary } = body;

//   try {
//     if (isPrimary) {
//       await prisma.address.updateMany({
//         where: {
//           userId: session.user.id,
//           isPrimary: true,
//           id: { not: id }
//         },
//         data: { isPrimary: false }
//       });
//     }

//     const updatedAddress = await prisma.address.update({
//       where: { id: id },
//       data: {
//         label,
//         fullAddress,
//         recipientName,
//         phoneNumber,
//         note,
//         isPrimary,
//       },
//     });

//     return NextResponse.json(updatedAddress, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Failed to update address", error },
//       { status: 500 }
//     );
//   }
// }

// // DELETE -> hapus alamat
// export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;


//   const session = await getServerSession(authOptions);

//   if (!session || !session.user?.id) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     await prisma.address.delete({
//       where: { id: id },
//     });

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to delete address", details: error },
//       { status: 500 }
//     );
//   }
// }
