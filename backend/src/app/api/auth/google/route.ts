import { Router } from "express";
import { googleLogin } from "./googleAuth";
// import { login, register } from "../controllers/auth/authController";

const router = Router();
router.post("/", googleLogin);

export default router;


// import { NextResponse } from "next/server";
// import { OAuth2Client } from "google-auth-library";
// import jwt from "jsonwebtoken";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export async function POST(req: Request) {
//     try {
//         const { idToken } = await req.json();

//         // 1. Verifikasi Token ke Google
//         const ticket = await client.verifyIdToken({
//             idToken,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });
//         const payload = ticket.getPayload();

//         if (!payload || !payload.email) {
//             return NextResponse.json({ error: "Token Google tidak valid" }, { status: 400 });
//         }

//         // 2. Logika Database dengan Prisma
//         // Kita cari user berdasarkan email
//         let user = await prisma.user.findUnique({
//             where: { email: payload.email },
//             select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 role: true,
//                 image: true,
//                 // password tidak kita ambil karena untuk login Google biasanya null
//             },
//         });

//         // 3. Jika user belum ada, buat user baru (Signup Otomatis)
//         if (!user) {
//             user = await prisma.user.create({
//                 data: {
//                     email: payload.email,
//                     name: payload.name,
//                     image: payload.picture, // Ambil foto profil dari Google
//                     role: "CUSTOMER",      // Sesuai default @default(CUSTOMER) di schema
//                     // password dibiarkan null karena login via OAuth
//                 },
//                 select: {
//                     id: true,
//                     name: true,
//                     email: true,
//                     role: true,
//                     image: true,
//                 },
//             });
//         }

//         // 4. Generate JWT Internal Aplikasi
//         // Kita masukkan role ke dalam token agar AuthCheck bisa memvalidasi
//         const appToken = jwt.sign(
//             {
//                 id: user.id,
//                 email: user.email,
//                 role: user.role
//             },
//             process.env.JWT_SECRET!,
//             { expiresIn: "7d" } // Token berlaku 7 hari
//         );

//         // 5. Kirim data user dan token ke Frontend
//         return NextResponse.json({
//             user: user,
//             token: appToken,
//         }, { status: 200 });

//     } catch (error: any) {
//         console.error("Google Auth Error:", error);
//         return NextResponse.json({ error: "Gagal autentikasi dengan Google" }, { status: 500 });
//     }
// }