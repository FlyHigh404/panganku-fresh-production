import { Router } from "express";
import { processCheckout } from "../../cart/checkout/checkout";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Middleware pengecekan CUSTOMER
const isCustomer = (req: any, res: any, next: any) => {
    if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({ error: "Akses ditolak: Hanya untuk Customer" });
    }
    next();
};

router.post("/checkout", authenticate, isCustomer, processCheckout);

export default router;

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { prisma } from "@/lib/prisma"
// import { authOptions } from "@/lib/auth"
// import midtransClient from "midtrans-client";

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session || session.user?.role !== "CUSTOMER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const url = new URL(req.url);
//     const orderId = url.searchParams.get("orderId"); // 🔥 ambil orderId dari query ?orderId=...
//     const { paymentMethod } = await req.json();

//     if (!orderId) {
//       return NextResponse.json(
//         { error: "Order ID is required" },
//         { status: 400 }
//       );
//     }

//     if (!paymentMethod) {
//       return NextResponse.json(
//         { error: "Payment method is required" },
//         { status: 400 }
//       );
//     }

//     // 🔥 Ambil order spesifik
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: {
//         orderItems: {
//           include: { product: true },
//         },
//         user: true,
//       },
//     });

//     if (!order || order.userId !== session.user.id) {
//       return NextResponse.json(
//         { error: "Order not found or unauthorized" },
//         { status: 404 }
//       );
//     }

//     if (order.status !== "PENDING") {
//       return NextResponse.json(
//         { error: "Order cannot be processed" },
//         { status: 400 }
//       );
//     }

//     // 🔥 Hitung ulang total dengan ongkir
//     const ONGKIR = 20000;
//     const productTotal = order.orderItems.reduce(
//       (sum: number, item: any) =>
//         sum + Number(item.unitPrice) * item.quantity,
//       0
//     );
//     const finalTotal = productTotal + ONGKIR;

//     // Update order total dan metode pembayaran
//     await prisma.order.update({
//       where: { id: order.id },
//       data: {
//         paymentMethod,
//         totalAmount: finalTotal,
//       },
//     });

//     // 🔥 Payment logic
//     if (paymentMethod === "QRIS") {
//       const parameter = {
//         payment_type: "qris",
//         transaction_details: {
//           order_id: order.id,
//           gross_amount: finalTotal,
//         },
//         qris: { acquirer: "gopay" },
//         customer_details: {
//           first_name: order.user.name || "Customer",
//           email: order.user.email || "customer@example.com",
//           phone: order.user.phone || "0000000000",
//         },
//       };

//       const midtrans = new midtransClient.CoreApi({
//         isProduction: false,
//         serverKey: process.env.MIDTRANS_SERVER_KEY!,
//         clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
//       });

//       const midtransResponse = await midtrans.charge(parameter);

//       return NextResponse.json({
//         success: true,
//         orderId: order.id,
//         paymentMethod: "QRIS",
//         totalAmount: finalTotal,
//         shippingCost: ONGKIR,
//         midtrans: {
//           transactionId: midtransResponse.transaction_id,
//           orderId: midtransResponse.order_id,
//           transactionStatus: midtransResponse.transaction_status,
//           fraudStatus: midtransResponse.fraud_status,
//           actions: midtransResponse.actions || [],
//           qrisUrl:
//             midtransResponse.actions?.find(
//               (a: any) => a.name === "generate-qr-code"
//             )?.url || null,
//         },
//         message:
//           "QRIS payment initiated. Please scan the QR to complete the payment.",
//       });
//     }

//     // 🔥 COD logic (langsung kurangi stok)
//     if (paymentMethod === "COD") {
//       await prisma.$transaction(async (tx) => {
//         for (const item of order.orderItems) {
//           await tx.product.update({
//             where: { id: item.productId },
//             data: { stock: { decrement: item.quantity } },
//           });
//         }

//         await tx.order.update({
//           where: { id: order.id },
//           data: { status: "PROCESSING" },
//         });
//       });

//       return NextResponse.json({
//         success: true,
//         orderId: order.id,
//         paymentMethod: "COD",
//         totalAmount: finalTotal,
//         shippingCost: ONGKIR,
//         orderItems: order.orderItems,
//         status: "PROCESSING",
//         message: "Order placed successfully with Cash on Delivery",
//       });
//     }

//     return NextResponse.json(
//       { error: "Invalid payment method" },
//       { status: 400 }
//     );
//   } catch (error: any) {
//     console.error("Error processing checkout:", error);
//     return NextResponse.json(
//       { error: "Failed to process checkout" },
//       { status: 500 }
//     );
//   }
// }