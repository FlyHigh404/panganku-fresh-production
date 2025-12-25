import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true, image: true }
                },
            }

        });
        return new Response(JSON.stringify(notifications));
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch notifications" }), { status: 500 });
    }
}