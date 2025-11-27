import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດການຂາຍບໍ່ຖືກຕ້ອງ",
    });
  }

  const sale = await prisma.sale.update({
    where: { id },
    data: {
      status: body.status,
      notes: body.notes,
    },
    include: {
      customer: true,
      user: { select: { id: true, name: true } },
      items: {
        include: {
          product: true,
          service: true,
        },
      },
    },
  });

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
    message: "ອັບເດດສະຖານະສຳເລັດ",
  };
});

