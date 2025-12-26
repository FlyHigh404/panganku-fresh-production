import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getDashboardStats } from "./dashboard";

const router = Router()

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};

router.use(authenticate, isAdmin);

router.get("/dashboard", getDashboardStats);

export default router;

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth"
// import { OrderStatus } from "@prisma/client";

// export async function GET(req: NextRequest) {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user?.role !== "ADMIN") {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     try {
//         const searchParams = req.nextUrl.searchParams;
//         const filterType = searchParams.get("filter") || "bulan"; 

//         const now = new Date();
//         const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//         const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//         const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

//         // 1. TOTAL PENGGUNA
//         const totalUsers = await prisma.user.count();
//         const usersLastMonth = await prisma.user.count({
//             where: {
//                 createdAt: {
//                     gte: lastMonth,
//                     lt: currentMonth,
//                 },
//             },
//         });
//         const usersTwoMonthsAgo = await prisma.user.count({
//             where: {
//                 createdAt: {
//                     gte: twoMonthsAgo,
//                     lt: lastMonth,
//                 },
//             },
//         });

//         const userChangePercentage =
//             usersTwoMonthsAgo > 0
//                 ? Math.round(
//                     ((usersLastMonth - usersTwoMonthsAgo) / usersTwoMonthsAgo) * 100
//                 )
//                 : 0;
//         const userChangeType = userChangePercentage >= 0 ? "positive" : "negative";

//         // 2. TOTAL PRODUK
//         const totalProducts = await prisma.product.count();
//         const productsLastMonth = await prisma.product.count({
//             where: {
//                 createdAt: {
//                     gte: lastMonth,
//                     lt: currentMonth,
//                 },
//             },
//         });
//         const productsTwoMonthsAgo = await prisma.product.count({
//             where: {
//                 createdAt: {
//                     gte: twoMonthsAgo,
//                     lt: lastMonth,
//                 },
//             },
//         });

//         const productChangePercentage =
//             productsTwoMonthsAgo > 0
//                 ? Math.round(
//                     ((productsLastMonth - productsTwoMonthsAgo) /
//                         productsTwoMonthsAgo) *
//                     100
//                 )
//                 : 0;
//         const productChangeType =
//             productChangePercentage >= 0 ? "positive" : "negative";

//         // 3. TOTAL PESANAN
//         const totalOrders = await prisma.order.count();
//         const ordersLastMonth = await prisma.order.count({
//             where: {
//                 createdAt: {
//                     gte: lastMonth,
//                     lt: currentMonth,
//                 },
//             },
//         });
//         const ordersTwoMonthsAgo = await prisma.order.count({
//             where: {
//                 createdAt: {
//                     gte: twoMonthsAgo,
//                     lt: lastMonth,
//                 },
//             },
//         });

//         const orderChangePercentage =
//             ordersTwoMonthsAgo > 0
//                 ? Math.round(
//                     ((ordersLastMonth - ordersTwoMonthsAgo) / ordersTwoMonthsAgo) * 100
//                 )
//                 : 0;
//         const orderChangeType =
//             orderChangePercentage >= 0 ? "positive" : "negative";

//         // 4. GRAFIK PENJUALAN
//         let salesData = [];

//         if (filterType === "bulan") {
//             const currentYear = now.getFullYear();
//             const months = [
//                 "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//             ];

//             for (let i = 0; i < 12; i++) {
//                 const monthStart = new Date(currentYear, i, 1);
//                 const monthEnd = new Date(currentYear, i + 1, 1);

//                 const result = await prisma.order.aggregate({
//                     where: {
//                         status: OrderStatus.COMPLETED,
//                         createdAt: {
//                             gte: monthStart,
//                             lt: monthEnd,
//                         },
//                     },
//                     _sum: {
//                         totalAmount: true,
//                     },
//                 });

//                 const totalAmount = result._sum.totalAmount || 0;

//                 const sales = Number(totalAmount);

//                 salesData.push({
//                     month: months[i],
//                     sales: sales, 
//                     year: currentYear,
//                 });
//             }
//         } else if (filterType === "minggu") {
//             const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

//             for (let i = 6; i >= 0; i--) {
//                 const dayStart = new Date(now);
//                 dayStart.setDate(now.getDate() - i);
//                 dayStart.setHours(0, 0, 0, 0);

//                 const dayEnd = new Date(dayStart);
//                 dayEnd.setHours(23, 59, 59, 999);

//                 const result = await prisma.order.aggregate({
//                     where: {
//                         status: OrderStatus.COMPLETED,
//                         createdAt: {
//                             gte: dayStart,
//                             lt: dayEnd,
//                         },
//                     },
//                     _sum: {
//                         totalAmount: true,
//                     },
//                 });

//                 const totalAmount = result._sum.totalAmount || 0;

//                 const sales = Number(totalAmount);

//                 const dayOfWeek = days[dayStart.getDay()];

//                 salesData.push({
//                     day: dayOfWeek,
//                     sales: sales, 
//                     year: dayStart.getFullYear(),
//                 });
//             }
//         }

//         return NextResponse.json({
//             cards: {
//                 users: {
//                     totalUsers,
//                     changePercentage: `${userChangePercentage >= 0 ? "+" : ""}${userChangePercentage}%`,
//                     changeType: userChangeType,
//                 },
//                 products: {
//                     totalProducts,
//                     changePercentage: `${productChangePercentage >= 0 ? "+" : ""}${productChangePercentage}%`,
//                     changeType: productChangeType,
//                 },
//                 orders: {
//                     totalOrders,
//                     changePercentage: `${orderChangePercentage >= 0 ? "+" : ""}${orderChangePercentage}%`,
//                     changeType: orderChangeType,
//                 },
//             },
//             salesData,
//         });
//     } catch (error) {
//         console.error("Dashboard API Error:", error);
//         return NextResponse.json(
//             { error: "Internal Server Error" },
//             { status: 500 }
//         );
//     }
// }