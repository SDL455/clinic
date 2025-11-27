import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { sales: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: users,
  };
});

