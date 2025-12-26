import { Response } from "express";
import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

// GET Admin Profile Self
export const getAdminProfile = async (req: AuthRequest, res: Response) => {
    try {
        // req.user.id didapat dari middleware authenticate
        const profile = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true, // Tambahan untuk verifikasi di frontend
            },
        });

        if (!profile) {
            return res.status(404).json({ error: "Admin profile not found" });
        }

        return res.json(profile);
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return res.status(500).json({ error: "Failed to fetch profile" });
    }
};

// PUT Update Admin Profile (Image)
export const updateAdminProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { image = "" } = req.body;

        const updatedProfile = await prisma.user.update({
            where: { id: req.user!.id },
            data: { image },
        });

        return res.json(updatedProfile);
    } catch (error) {
        console.error("Error updating admin profile:", error);
        return res.status(500).json({ error: "Failed to update profile" });
    }
};