import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';
import dotenv from "dotenv";

dotenv.config();
// Mengambil secret dari env, pastikan as string agar tidak error overload
const JWT_SECRET = process.env.JWT_SECRET as string;

export const signIn = async (req: Request, res: Response) => {
    try {

        console.log("Data login masuk:", req.body);
        const { identifier, password } = req.body;
        // const { email, password } = req.body;

        // 1. Validasi Input (Sesuai logika authorize di auth.ts)
        // if (!email || !password) {
        //     return res.status(400).json({ error: "Email dan password diperlukan" });
        // }

        if (!identifier || !password) {
            return res.status(400).json({ error: "Email/Nomor HP dan password diperlukan" });
        }

        // 2. Cari user di database
        // const user = await prisma.user.findUnique({
        //     where: { email },
        // });

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier }
                ]
            },
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: "User tidak ditemukan" });
        }

        if (!user.emailVerified) {
            return res.status(403).json({ error: "Email Anda belum diverifikasi. Silakan cek inbox email Anda." });
        }

        const isCorrectPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!isCorrectPassword) {
            return res.status(401).json({ error: "Password salah" });
        }

        // token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6. Respon Sukses (Mengembalikan data user seperti di authorize)
        return res.json({
            message: "Login berhasil",
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
                image: user.image,
            },
            token: token
        });

    } catch (error) {
        console.error("SignIn Error:", error);
        return res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
};

// Anda bisa menambahkan fungsi signUp di sini juga jika ingin digabung

// import NextAuth from "next-auth";
// import { authOptions } from "@/lib/auth";

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
