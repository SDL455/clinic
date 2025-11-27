import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດການຂາຍບໍ່ຖືກຕ້ອງ",
    });
  }

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { id: true, name: true } },
      promotion: true,
      items: {
        include: {
          product: { include: { category: true } },
          service: true,
        },
      },
    },
  });

  if (!sale) {
    throw createError({
      statusCode: 404,
      message: "ບໍ່ພົບການຂາຍ",
    });
  }

  return {
    success: true,
    data: {
      ...sale,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      total: Number(sale.total),
      items: sale.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
      })),
    },
  };
});

