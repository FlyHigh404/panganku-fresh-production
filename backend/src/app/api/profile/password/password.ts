import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import bcrypt from "bcryptjs";

export const changePassword = async (req: AuthRequest, res: Response) => {
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

    // Jika user belum punya password (misal login via OAuth pertama kali)
    if (!user.password) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword },
      });
      return res.json({ message: "Password set successfully" });
    }

    // Validasi password saat ini
    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update ke password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Failed to update password" });
  }
};