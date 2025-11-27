import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດລູກຄ້າບໍ່ຖືກຕ້ອງ",
    });
  }

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: true,
              service: true,
            },
          },
        },
      },
    },
  });

  if (!customer) {
    throw createError({
      statusCode: 404,
      message: "ບໍ່ພົບລູກຄ້າ",
    });
  }

  return {
    success: true,
    data: {
      ...customer,
      sales: customer.sales.map((sale) => ({
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
    },
  };
});

