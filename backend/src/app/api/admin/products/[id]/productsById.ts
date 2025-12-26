import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "@/app/api/middleware/auth.middleware";

// ... fungsi getAdminProducts dan createProduct sebelumnya

// PUT Update Product by ID (Admin Only)
export const updateProduct = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const { name, description, price, stock, categoryId, imageUrl } = req.body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                stock: stock ? parseInt(stock) : undefined,
                categoryId,
                imageUrl,
            },
            include: {
                category: true,
            },
        });

        return res.json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "Failed to update product" });
    }
};

// DELETE Product by ID (Admin Only)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { id },
        });
        return res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "Failed to delete product" });
    }
};