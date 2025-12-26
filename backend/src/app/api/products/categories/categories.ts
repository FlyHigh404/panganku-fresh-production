import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const kategori = await prisma.category.findMany();
    return res.json(kategori);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
};