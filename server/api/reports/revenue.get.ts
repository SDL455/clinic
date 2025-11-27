import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const query = getQuery(event);
  const period = query.period as string || "daily";
  const startDate = query.startDate
    ? new Date(query.startDate as string)
    : new Date(new Date().setDate(new Date().getDate() - 30));
  const endDate = query.endDate ? new Date(query.endDate as string) : new Date();

  // Adjust endDate to end of day
  endDate.setHours(23, 59, 59, 999);

  const sales = await prisma.sale.findMany({
    where: {
      status: "PAID",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Group by period
  const grouped = new Map<string, { revenue: number; count: number }>();

  for (const sale of sales) {
    let key: string;
    const date = new Date(sale.createdAt);

    switch (period) {
      case "yearly":
        key = date.getFullYear().toString();
        break;
      case "monthly":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "weekly":
        // Get week number
        const oneJan = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(
          ((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7
        );
        key = `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
        break;
      default: // daily
        key = date.toISOString().split("T")[0];
    }

    const current = grouped.get(key) || { revenue: 0, count: 0 };
    current.revenue += Number(sale.total);
    current.count += 1;
    grouped.set(key, current);
  }

  const report = Array.from(grouped.entries()).map(([period, data]) => ({
    period,
    ...data,
  }));

  // Calculate totals
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
  const totalCount = sales.length;

  return {
    success: true,
    data: {
      report,
      summary: {
        totalRevenue,
        totalCount,
        avgPerSale: totalCount > 0 ? totalRevenue / totalCount : 0,
      },
    },
  };
});

