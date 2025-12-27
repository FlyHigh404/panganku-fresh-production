import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";

export const getCart = async (req: any, res: Response) => {
    try {
        const orderIdParam = req.query.orderId as string;

        const whereClause: any = {
            userId: req.user.id, // Diambil dari token
            status: "PENDING",
        };

        if (orderIdParam) {
            whereClause.id = orderIdParam;
        }

        const order = await prisma.order.findFirst({
            where: whereClause,
            include: {
                orderItems: {
                    include: { product: true },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json(order);
    } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({ error: "Failed to fetch cart" });
    }
};

export const addToCart = async (req: any, res: Response) => {
    try {
        const { productId, quantity, unitPrice } = req.body;

        // 1. Cari atau buat order PENDING
        let order = await prisma.order.findFirst({
            where: {
                userId: req.user.id,
                status: "PENDING",
            },
        });

        if (!order) {
            order = await prisma.order.create({
                data: {
                    userId: req.user.id,
                    totalAmount: 0,
                    status: "PENDING",
                },
            });
        }

        // 2. Cek apakah item sudah ada di keranjang
        const existingItem = await prisma.orderItem.findFirst({
            where: {
                orderId: order.id,
                productId,
            },
        });

        if (existingItem) {
            await prisma.orderItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId,
                    quantity,
                    unitPrice,
                },
            });
        }

        // 3. Update total amount + Ongkir (20.000)
        const items = await prisma.orderItem.findMany({
            where: { orderId: order.id },
        });

        const total = items.reduce(
            (acc, item) => acc + Number(item.unitPrice) * item.quantity,
            0
        );

        const totalWithOngkir = total + 20000;

        await prisma.order.update({
            where: { id: order.id },
            data: { totalAmount: totalWithOngkir },
        });

        return res.json({ message: "Added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({ error: "Failed to add to cart" });
    }
};

export const updateCartItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // Mengambil [id] dari URL
        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be greater than 0" });
        }

        const updatedItem = await prisma.orderItem.update({
            where: { id: id },
            data: { quantity: Number(quantity) },
        });

        return res.json({ message: "Item updated", item: updatedItem });
    } catch (error) {
        console.error("Error updating item:", error);
        return res.status(500).json({ error: "Failed to update item" });
    }
};

// Fungsi untuk Hapus Item dari Cart
export const deleteCartItem = async (req: any, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.orderItem.delete({
            where: { id: id },
        });

        return res.json({ message: "Item removed" });
    } catch (error) {
        console.error("Error deleting item:", error);
        return res.status(500).json({ error: "Failed to delete item" });
    }
};