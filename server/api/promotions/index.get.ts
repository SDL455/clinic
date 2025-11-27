import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const query = getQuery(event);
  const activeOnly = query.activeOnly === "true";

  const where: Parameters<typeof prisma.promotion.findMany>[0]["where"] = {};

  if (activeOnly) {
    const now = new Date();
    where.isActive = true;
    where.startDate = { lte: now };
    where.endDate = { gte: now };
  }

  const promotions = await prisma.promotion.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: promotions.map((p) => ({
      ...p,
      discount: Number(p.discount),
    })),
  };
});

