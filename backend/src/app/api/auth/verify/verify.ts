import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { Request, Response } from 'express';

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token) return res.status(400).json({ error: "Token tidak valid" });

    try {
        const verificationToken = await prisma.verificationToken.findFirst({
            where: {
                token: String(token)
            }
        });

        if (!verificationToken || verificationToken.expires < new Date()) {
            return res.status(400).json({ error: "Token tidak valid"})
        }

        await prisma.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() }
        })

        await prisma.verificationToken.deleteMany({
            where: { token: String(token) }
        });

        return res.status(200).json({ message: "Email berhasil di verifikasi" })
    } catch(error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}