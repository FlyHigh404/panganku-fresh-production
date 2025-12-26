import { Response } from "express";
import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET All Categories with Product Count (Admin)
export const getAdminCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // Transformasi data sesuai format asli Next.js Anda
    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      productCount: category._count.products
    }));

    return res.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// POST Create New Category (Admin)
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    return res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ error: "Failed to create category" });
  }
};