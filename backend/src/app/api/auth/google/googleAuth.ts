import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../lib/prisma";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    // 1. Verifikasi Token ke Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Token Google tidak valid" });
    }

    // 2. Logika Database dengan Prisma
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    });

    // 3. Signup Otomatis jika user belum ada
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || "User",
          image: payload.picture,
          role: "CUSTOMER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
        },
      });
    }

    // 4. Generate JWT Internal Aplikasi
    const appToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 5. Kirim data ke Frontend
    return res.status(200).json({
      user: user,
      token: appToken,
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ error: "Gagal autentikasi dengan Google" });
  }
};