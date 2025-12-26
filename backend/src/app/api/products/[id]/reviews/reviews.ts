import { Request, Response } from "express";
import { prisma } from "../../../../../lib/prisma";
import { AuthRequest } from "../../../middleware/auth.middleware";

// GET reviews by productId
export const getProductReviews = async (req: Request, res: Response) => {
    const { id } = req.params; // ID Produk
    try {
        const reviews = await prisma.review.findMany({
            where: { productId: id },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Failed to fetch reviews" });
    }
};

// POST add review
export const addProductReview = async (req: AuthRequest, res: Response) => {
    const { id } = req.params; // ID Produk
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content required" });
    }

    try {
        const newReview = await prisma.review.create({
            data: {
                content,
                productId: id,
                userId: req.user!.id,
            },
        });

        return res.status(201).json(newReview);
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ error: "Failed to create review" });
    }
};

// DELETE review
export const deleteProductReview = async (req: AuthRequest, res: Response) => {
    const { id } = req.params; // Ini adalah ID Review (sesuai logika delete Anda)

    try {
        const review = await prisma.review.delete({
            where: {
                id: id,
                userId: req.user!.id,
            },
        });

        return res.json(review);
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ error: "Failed to delete review" });
    }
};