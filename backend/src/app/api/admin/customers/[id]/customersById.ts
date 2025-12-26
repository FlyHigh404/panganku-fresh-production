import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "@/app/api/middleware/auth.middleware";

// ... fungsi getAllCustomers sebelumnya

// GET Detail Customer by ID (Admin Only)
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                product: true // Mengambil info produk di setiap item pesanan
              }
            }
          },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(customer);
  } catch (error: any) {
    console.error("Error fetching customer:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    });
  }
};