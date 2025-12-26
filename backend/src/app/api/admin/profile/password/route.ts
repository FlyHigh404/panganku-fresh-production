import { Router } from "express";
import { authenticate } from "@/app/api/middleware/auth.middleware";
import { updateAdminPassword } from "./password";

const router = Router()

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/profile/password", updateAdminPassword);

export default router;

// import {NextResponse, NextRequest} from 'next/server';
// import {getServerSession} from 'next-auth';
// import { prisma } from "@/lib/prisma"
// import bcrypt from 'bcryptjs';
// import { authOptions } from "@/lib/auth"

// export async function PUT(req: NextRequest) {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "ADMIN") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     try {
//         const { currentPassword, newPassword } = await req.json();
//         if (!newPassword) {
//             return NextResponse.json({ error: "Password baru tidak boleh kosong" }, { status: 400 });
//         }

//         const user = await prisma.user.findUnique({
//             where: { id: session.user.id },
//             select: { password: true },
//         });
//         if (!user) {
//             return NextResponse.json({ error: "User not found" }, { status: 404 });
//         }

//         if (!user.password) {
//             const hashedPassword = await bcrypt.hash(newPassword, 10);
//             await prisma.user.update({
//                 where: { id: session.user.id },
//                 data: { password: hashedPassword },
//             });
//             return NextResponse.json({ message: "Password berhasil diganti" });
//         }

//         if (!currentPassword) {
//             return NextResponse.json({ error: "Password lama harus diisi" }, { status: 400 });
//         }

//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
//         }

//         const hashedPassword = await bcrypt.hash(newPassword, 10);
//         await prisma.user.update({
//             where: { id: session.user.id },
//             data: { password: hashedPassword },
//         });
//         return NextResponse.json({ message: "Password berhasil diganti" });
//     } catch (error) {
//         console.error("Error updating password:", error);
//         return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
//     }
// }