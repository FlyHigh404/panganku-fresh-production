import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getAdminProfile, updateAdminProfile } from "./profile";

const router = Router()

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/profile", getAdminProfile);
router.get("/profile", updateAdminProfile);

export default router;


// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"

// export async function GET() {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user?.role !== "ADMIN") {
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
//     if (!session || session.user?.role !== "ADMIN") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const { image = "" } = await req.json();

//         const updatedProfile = await prisma.user.update({
//             where: { id: session.user.id },
//             data: { image },
//         });

//         return NextResponse.json(updatedProfile);
//     } catch (error) {
//         console.error("Error updating profile:", error);
//         return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
//     }
// }
