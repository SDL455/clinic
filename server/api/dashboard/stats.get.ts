import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all products for low stock check (need to compare stock with minStock)
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { stock: true, minStock: true },
  });

  const lowStockCount = allProducts.filter((p) => p.stock <= p.minStock).length;

  // Get statistics
  const [
    totalSales,
    totalRevenue,
    totalCustomers,
    todayRevenue,
    weekRevenue,
    monthRevenue,
  ] = await Promise.all([
    // Total sales count
    prisma.sale.count(),

    // Total revenue
    prisma.sale.aggregate({
      _sum: { total: true },
      where: { status: "PAID" },
    }),

    // Total customers
    prisma.customer.count(),

    // Today's revenue
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        status: "PAID",
        createdAt: { gte: startOfDay },
      },
    }),

    // This week's revenue
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        status: "PAID",
        createdAt: { gte: startOfWeek },
      },
    }),

    // This month's revenue
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        status: "PAID",
        createdAt: { gte: startOfMonth },
      },
    }),
  ]);

  return {
    success: true,
    data: {
      totalSales,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalCustomers,
      lowStockProducts: lowStockCount,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      weekRevenue: Number(weekRevenue._sum.total || 0),
      monthRevenue: Number(monthRevenue._sum.total || 0),
    },
  };
});
