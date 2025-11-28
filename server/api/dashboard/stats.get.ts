import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const now = new Date();
  
  // Calculate date ranges
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);
  
  // Start of this week (Sunday)
  const startOfThisWeek = new Date(startOfToday);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay());
  
  // End of this week (Saturday)
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);
  endOfThisWeek.setHours(23, 59, 59, 999);
  
  // Start of this month
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // End of this month
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfThisMonth.setHours(23, 59, 59, 999);

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

    // Total revenue (all statuses)
    prisma.sale.aggregate({
      _sum: { total: true },
    }),

    // Total customers
    prisma.customer.count(),

    // Today's revenue - calculate for each day separately
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    }),

    // This week's revenue - calculate for each week separately
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: startOfThisWeek,
          lte: endOfThisWeek,
        },
      },
    }),

    // This month's revenue - calculate for each month separately
    prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: startOfThisMonth,
          lte: endOfThisMonth,
        },
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
