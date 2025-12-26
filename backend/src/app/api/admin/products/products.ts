import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET All Products for Admin List
export const getAdminProducts = async (req: AuthRequest, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                imageUrl: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            }
        });
        return res.json(products);
    } catch (error) {
        console.error("Error fetching admin products:", error);
        return res.status(500).json({ error: "Failed to fetch products" });
    }
};

// POST Create New Product (Admin Only)
export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, stock, categoryId, imageUrl } = req.body;

        // Validasi field yang wajib diisi
        if (!name || !price || !stock || !categoryId || !imageUrl || imageUrl.length === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description: description || "",
                price: parseFloat(price),
                stock: parseInt(stock),
                categoryId,
                imageUrl,
            },
            include: {
                category: true,
            },
        });

        return res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ error: "Failed to create product" });
    }
};