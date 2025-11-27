import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດສິນຄ້າບໍ່ຖືກຕ້ອງ",
    });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw createError({
      statusCode: 404,
      message: "ບໍ່ພົບສິນຄ້າ",
    });
  }

  return {
    success: true,
    data: {
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
      isLowStock: product.stock <= product.minStock,
      isOutOfStock: product.stock === 0,
    },
  };
});

