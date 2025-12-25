// api/admin/order/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getServerSession } from 'next-auth/next';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        phone: true,
                        Address: {
                            where: { isPrimary: true },
                            select: { fullAddress: true },
                        },
                    },
                },
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }

}


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { status } = await request.json();

        const allowedStatuses = ['PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELED'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            },
            include: {
                user: {
                    include: {
                        Address: true
                    }
                },
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // simpan ke tabel Notification
        const message = `Your order ${id} status has been updated to ${status}`;
        const notification = await prisma.notification.create({
            data: {
                userId: updatedOrder.user.id,
                message,
            },
        });

        // kirim event ke server websocket (kalau aktif)
        await fetch(`${process.env.WS_SERVER_URL}/notify/order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: updatedOrder.user.id,
                notification,
            }),
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}