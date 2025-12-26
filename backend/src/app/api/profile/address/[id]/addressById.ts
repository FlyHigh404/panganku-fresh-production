import { prisma } from "@/lib/prisma";
import { AuthRequest } from "@/app/api/middleware/auth.middleware";
import { Response } from "express";


// UPDATE Address by ID
export const updateAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { label, fullAddress, recipientName, phoneNumber, note, isPrimary } = req.body;

  try {
    // Jika user menandai ini sebagai alamat utama
    if (isPrimary) {
      // Ubah alamat lain yang tadinya primary menjadi false
      await prisma.address.updateMany({
        where: {
          userId: req.user!.id,
          isPrimary: true,
          id: { not: id }
        },
        data: { isPrimary: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: id },
      data: {
        label,
        fullAddress,
        recipientName,
        phoneNumber,
        note,
        isPrimary,
      },
    });

    return res.status(200).json(updatedAddress);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update address", error });
  }
};

// DELETE Address by ID
export const deleteAddress = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.address.delete({
      where: { id: id },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete address", details: error });
  }
};