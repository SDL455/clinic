import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 100;
  const search = query.search as string;
  const categoryId = query.categoryId
    ? parseInt(query.categoryId as string)
    : undefined;
  const filter = query.filter as string;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  // Get products with pagination
  let products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  // Filter for low stock if needed (need to compare in JS since Prisma can't compare two fields)
  if (filter === "low-stock") {
    products = products.filter((p) => p.stock <= p.minStock);
  }

  const total = await prisma.product.count({ where });

  return {
    success: true,
    data: products.map((p) => ({
      ...p,
      price: Number(p.price),
      costPrice: Number(p.costPrice),
      isLowStock: p.stock <= p.minStock,
      isOutOfStock: p.stock === 0,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
});
