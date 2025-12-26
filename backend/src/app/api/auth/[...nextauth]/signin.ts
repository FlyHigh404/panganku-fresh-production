import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

// Mengambil secret dari env, pastikan as string agar tidak error overload
const JWT_SECRET = process.env.JWT_SECRET as string;

export const signIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // 1. Validasi Input (Sesuai logika authorize di auth.ts)
        if (!email || !password) {
            return res.status(400).json({ error: "Email dan password diperlukan" });
        }

        // 2. Cari user di database
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // 3. Verifikasi User (Sesuai logika authorize di auth.ts)
        if (!user || !user.password) {
            return res.status(401).json({ error: "User tidak ditemukan" });
        }

        // 4. Bandingkan password menggunakan bcrypt
        const isCorrectPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!isCorrectPassword) {
            return res.status(401).json({ error: "Password salah" });
        }

        // 5. Buat Token JWT Asli
        // Payload mencakup id dan role sesuai dengan callback jwt di auth.ts
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
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
