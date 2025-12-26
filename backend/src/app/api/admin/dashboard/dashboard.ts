import { Response } from "express";
import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { OrderStatus } from "@prisma/client";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const filterType = req.query.filter || "bulan"; 

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    // 1. TOTAL PENGGUNA & PERUBAHAN
    const totalUsers = await prisma.user.count();
    const usersLastMonth = await prisma.user.count({
      where: { createdAt: { gte: lastMonth, lt: currentMonth } },
    });
    const usersTwoMonthsAgo = await prisma.user.count({
      where: { createdAt: { gte: twoMonthsAgo, lt: lastMonth } },
    });

    const userChangePercentage = usersTwoMonthsAgo > 0
      ? Math.round(((usersLastMonth - usersTwoMonthsAgo) / usersTwoMonthsAgo) * 100)
      : 0;

    // 2. TOTAL PRODUK & PERUBAHAN
    const totalProducts = await prisma.product.count();
    const productsLastMonth = await prisma.product.count({
      where: { createdAt: { gte: lastMonth, lt: currentMonth } },
    });
    const productsTwoMonthsAgo = await prisma.product.count({
      where: { createdAt: { gte: twoMonthsAgo, lt: lastMonth } },
    });

    const productChangePercentage = productsTwoMonthsAgo > 0
      ? Math.round(((productsLastMonth - productsTwoMonthsAgo) / productsTwoMonthsAgo) * 100)
      : 0;

    // 3. TOTAL PESANAN & PERUBAHAN
    const totalOrders = await prisma.order.count();
    const ordersLastMonth = await prisma.order.count({
      where: { createdAt: { gte: lastMonth, lt: currentMonth } },
    });
    const ordersTwoMonthsAgo = await prisma.order.count({
      where: { createdAt: { gte: twoMonthsAgo, lt: lastMonth } },
    });

    const orderChangePercentage = ordersTwoMonthsAgo > 0
      ? Math.round(((ordersLastMonth - ordersTwoMonthsAgo) / ordersTwoMonthsAgo) * 100)
      : 0;

    // 4. DATA GRAFIK PENJUALAN
    let salesData = [];
    if (filterType === "bulan") {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(now.getFullYear(), i, 1);
        const monthEnd = new Date(now.getFullYear(), i + 1, 1);
        const result = await prisma.order.aggregate({
          where: { status: OrderStatus.COMPLETED, createdAt: { gte: monthStart, lt: monthEnd } },
          _sum: { totalAmount: true },
        });
        salesData.push({ month: months[i], sales: Number(result._sum.totalAmount || 0), year: now.getFullYear() });
      }
    } else {
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        const result = await prisma.order.aggregate({
          where: { status: OrderStatus.COMPLETED, createdAt: { gte: dayStart, lt: dayEnd } },
          _sum: { totalAmount: true },
        });
        salesData.push({ day: days[dayStart.getDay()], sales: Number(result._sum.totalAmount || 0), year: dayStart.getFullYear() });
      }
    }

    return res.json({
      cards: {
        users: { totalUsers, changePercentage: `${userChangePercentage >= 0 ? "+" : ""}${userChangePercentage}%`, changeType: userChangePercentage >= 0 ? "positive" : "negative" },
        products: { totalProducts, changePercentage: `${productChangePercentage >= 0 ? "+" : ""}${productChangePercentage}%`, changeType: productChangePercentage >= 0 ? "positive" : "negative" },
        orders: { totalOrders, changePercentage: `${orderChangePercentage >= 0 ? "+" : ""}${orderChangePercentage}%`, changeType: orderChangePercentage >= 0 ? "positive" : "negative" },
      },
      salesData,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};