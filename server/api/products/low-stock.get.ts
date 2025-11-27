import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  // Get all active products
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { stock: "asc" },
  });

  // Filter products with low stock (stock <= minStock)
  const lowStockProducts = allProducts
    .filter((p) => p.stock <= p.minStock)
    .slice(0, 20);

  return {
    success: true,
    data: lowStockProducts.map((p) => ({
      ...p,
      price: Number(p.price),
      costPrice: Number(p.costPrice),
    })),
  };
});
