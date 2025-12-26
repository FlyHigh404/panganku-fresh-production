import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET All Customers (Admin Only)
export const getAllCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" }, // Hanya mengambil user dengan role CUSTOMER
      },
      include: {
        orders: true,   // Riwayat pesanan user
        Address: true   // Daftar alamat user
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return res.status(500).json({ error: "Failed to fetch customers" });
  }
};