import { Response } from "express";
import { prisma } from "../../../../../lib/prisma";
import { AuthRequest } from "../../../middleware/auth.middleware";

export const getProductRatings = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
        const ratings = await prisma.rating.findMany({
            where: { productId: id },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
        });

        const average = ratings.length > 0
            ? ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length
            : 0;

        return res.json({ ratings, average });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch ratings" });
    }
};

// POST/UPSERT Rating
export const upsertProductRating = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { value } = req.body;

    if (!value || value < 1 || value > 5) {
        return res.status(400).json({ error: "Rating must be 1-5" });
    }

    try {
        const rating = await prisma.rating.upsert({
            where: {
                productId_userId: {
                    productId: id,
                    userId: req.user!.id,
                },
            },
            update: { value },
            create: {
                value,
                productId: id,
                userId: req.user!.id,
            },
        });
        return res.status(201).json(rating);
    } catch (error) {
        return res.status(500).json({ error: "Failed to upsert rating" });
    }
};

// DELETE Rating
export const deleteProductRating = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.rating.delete({
            where: {
                productId_userId: {
                    productId: id,
                    userId: req.user!.id,
                },
            },
        });
        return res.json({ message: "Rating deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete rating" });
    }
};