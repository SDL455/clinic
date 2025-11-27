import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const query = getQuery(event);
  const phone = query.phone as string;

  if (!phone) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນເບີໂທ",
    });
  }

  const customer = await prisma.customer.findUnique({
    where: { phone },
  });

  return {
    success: true,
    data: {
      exists: !!customer,
      customer: customer || null,
    },
  };
});

