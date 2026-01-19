import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Response } from "express";

export const fetchPrimaryAddressInternal = async (userId: string) => {
  return await prisma.address.findFirst({
    where: {
      userId: userId,
      isPrimary: true,
    },
  });
};

export const getPrimaryAddress = async (req: AuthRequest, res: Response) => {
  try {
    const primaryAddress = await fetchPrimaryAddressInternal(req.user!.id)
    // Mengembalikan data atau null jika tidak ada alamat utama
    return res.status(200).json(primaryAddress || null);
  } catch (error) {
    console.error("Error fetching primary address:", error);
    return res.status(500).json({ error: "Failed to fetch primary address" });
  }
};