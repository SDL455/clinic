import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);

  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;
  const search = query.search as string;
  const status = query.status as string;

  const skip = (page - 1) * limit;

  const where: Parameters<typeof prisma.sale.findMany>[0]["where"] = {};

  // For employees, only show sales from the last 24 hours
  if (user.role === "EMPLOYEE") {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    where.createdAt = {
      gte: twentyFourHoursAgo,
    };
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { customer: { firstName: { contains: search } } },
      { customer: { lastName: { contains: search } } },
      { customer: { phone: { contains: search } } },
    ];
  }

  if (status) {
    where.status = status as "PAID" | "UNPAID" | "TRANSFER";
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        customer: true,
        user: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            product: true,
            service: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    success: true,
    data: sales.map((sale) => ({
      ...sale,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      total: Number(sale.total),
      items: sale.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
      })),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
});

