import { Response } from "express";
import { prisma } from "@/lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// GET User Profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        address: true,
      },
    });
    
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// PUT Update Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address = "", image = "" } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const updatedProfile = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, address, image },
    });

    return res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};