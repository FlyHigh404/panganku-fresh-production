import { prisma } from "@/lib/prisma";
import { AuthRequest } from "@/app/api/middleware/auth.middleware";
import { Response } from "express";

// UPDATE Category by ID (Admin)
export const updateCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { name, description, imageUrl } = req.body;

    const updatedImageUrl = imageUrl ? imageUrl : null;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl: updatedImageUrl,
      },
    });

    return res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ error: "Failed to update category" });
  }
};

// DELETE Category by ID (Admin)
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({
      where: { id },
    });

    return res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({ error: "Failed to delete category" });
  }
};