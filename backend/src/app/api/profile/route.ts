import { Router } from "express";
import { getProfile, updateProfile } from "./profile";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Middleware pengecekan role CUSTOMER
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Unauthorized: Customer only" });
    }
    next();
};

// Route: /app/api/profile
router.get("/", authenticate, isCustomer, getProfile);
router.put("/", authenticate, isCustomer, updateProfile);

export default router;

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"

// export async function GET() {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     try {
//         const profile = await prisma.user.findUnique({
//             where: { id: session.user.id },
//             select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 image: true,
//                 phone: true,
//                 address: true,
//             },
//         })
//         return NextResponse.json(profile);
//     } catch (error) {
//         console.error("Error fetching profile:", error);
//         return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
//     }

// }

// export async function PUT(req: NextRequest) {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user?.role !== "CUSTOMER") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const { name, phone, address = "", image = "" } = await req.json();

//         if (!name || !phone) {
//             return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
//         }

//         const updatedProfile = await prisma.user.update({
//             where: { id: session.user.id },
//             data: { name, phone, address, image },
//         });

//         return NextResponse.json(updatedProfile);
//     } catch (error) {
//         console.error("Error updating profile:", error);
//         return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
//     }
// }
