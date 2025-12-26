import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Response } from "express";

export const getPrimaryAddress = async (req: AuthRequest, res: Response) => {
  try {
    const primaryAddress = await prisma.address.findFirst({
      where: {
        userId: req.user!.id,
        isPrimary: true,
      },
    });

    // Mengembalikan data atau null jika tidak ada alamat utama
    return res.status(200).json(primaryAddress || null);
  } catch (error) {
    console.error("Error fetching primary address:", error);
    return res.status(500).json({ error: "Failed to fetch primary address" });
  }
};