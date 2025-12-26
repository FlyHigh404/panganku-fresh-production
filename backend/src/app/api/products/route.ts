import { Router } from "express";
import { getBestSellers } from "./products";

const router = Router();

// Endpoint: /app/api/products/
router.get("/", getBestSellers);

export default router;