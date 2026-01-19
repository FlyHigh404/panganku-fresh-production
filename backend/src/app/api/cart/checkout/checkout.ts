import { response, Response } from "express";
import { prisma } from "../../../../lib/prisma";
import midtransClient from "midtrans-client";
import { fetchPrimaryAddressInternal } from "../../profile/address-primary/address-primary";
import { calculateShippingCostInternal } from "../../shipping/ongkir";

export const processCheckout = async (req: any, res: Response) => {
  try {
    const orderId = req.query.orderId as string; // Ambil dari ?orderId=...
    const { paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ error: "Order ID and Payment Method are required" });
    }

    // 1. Ambil data order spesifik
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });

    // 2. Validasi Kepemilikan dan Status
    if (!order || order.userId !== req.user.id) {
      return res.status(404).json({ error: "Order not found or unauthorized" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Order cannot be processed" });
    }

    // get the ongkir
    const primaryAddress = await fetchPrimaryAddressInternal(order.userId);
    if (!primaryAddress) {
      return res.status(400).json({ error: "Please set a primary address first" });
    }

    const shippingInfo = await calculateShippingCostInternal(primaryAddress.id);
    const ongkir = shippingInfo.shippingCost;

    // calculate total amount
    const productTotal = order.orderItems.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
      0
    );
    const finalTotal = productTotal + ongkir;

    // 4. Update order di database
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod, totalAmount: finalTotal },
    });

    // --- LOGIKA PEMBAYARAN QRIS (MIDTRANS) ---
    if (paymentMethod === "QRIS") {
      const midtrans = new midtransClient.CoreApi({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY as string,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string,
      });

      const parameter = {
        payment_type: "qris",
        transaction_details: {
          order_id: order.id,
          gross_amount: finalTotal,
        },
        qris: { acquirer: "gopay" },
        customer_details: {
          first_name: order.user.name || "Customer",
          email: order.user.email || "customer@example.com",
        },
      };

      const midtransResponse = await midtrans.charge(parameter);

      return res.json({
        success: true,
        orderId: order.id,
        paymentMethod: "QRIS",
        totalAmount: finalTotal,
        midtrans: {
          transactionId: midtransResponse.transaction_id,
          qrisUrl: midtransResponse.actions?.find((a: any) => a.name === "generate-qr-code")?.url || null,
        },
        message: "QRIS payment initiated",
      });
    }

    // --- LOGIKA PEMBAYARAN COD ---
    if (paymentMethod === "COD") {
      // Gunakan Transaction agar stok konsisten
      await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: { status: "PROCESSING" },
        });
      });

      return res.json({
        success: true,
        orderId: order.id,
        paymentMethod: "COD",
        status: "PROCESSING",
        message: "Order placed successfully with COD",
      });
    }

    return res.status(400).json({ error: "Invalid payment method" });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ error: "Failed to process checkout" });
  }
};