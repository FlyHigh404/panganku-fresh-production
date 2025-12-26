import { Response } from "express";
import { prisma } from "../../../../../lib/prisma";
import { AuthRequest } from "../../../middleware/auth.middleware";
import bcrypt from 'bcryptjs';

// PUT Update Admin Password
export const updateAdminPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: "Password baru tidak boleh kosong" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { password: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Kasus 1: User belum punya password (misal login via Google/OAuth)
        if (!user.password) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: { id: req.user!.id },
                data: { password: hashedPassword },
            });
            return res.json({ message: "Password berhasil diganti" });
        }

        // Kasus 2: User memiliki password (verifikasi password lama wajib)
        if (!currentPassword) {
            return res.status(400).json({ error: "Password lama harus diisi" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Password saat ini salah" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { password: hashedPassword },
        });

        return res.json({ message: "Password berhasil diganti" });
    } catch (error) {
        console.error("Error updating admin password:", error);
        return res.status(500).json({ error: "Failed to update password" });
    }
};