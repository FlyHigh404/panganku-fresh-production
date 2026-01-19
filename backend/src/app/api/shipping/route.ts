import { Router } from "express";
import { getGeoCode } from "./location"
import { authenticate } from "../middleware/auth.middleware";
import { estimateShippingCost } from "./ongkir";

const router = Router();

const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized: Customer only" });
    }
    next();
};

router.get('/geocode', authenticate, isCustomer, getGeoCode);
router.get('/estimate', authenticate, isCustomer, estimateShippingCost);

export default router;