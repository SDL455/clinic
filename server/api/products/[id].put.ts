import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດສິນຄ້າບໍ່ຖືກຕ້ອງ",
    });
  }

  // Check if product exists
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw createError({
      statusCode: 404,
      message: "ບໍ່ພົບສິນຄ້າ",
    });
  }

  // Update product
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      price: body.price ?? existing.price,
      costPrice: body.costPrice ?? existing.costPrice,
      stock: body.stock ?? existing.stock,
      minStock: body.minStock ?? existing.minStock,
      categoryId: body.categoryId ?? existing.categoryId,
      isActive: body.isActive ?? existing.isActive,
    },
    include: { category: true },
  });

  return {
    success: true,
    data: {
      ...product,
      price: Number(product.price),
      costPrice: Number(product.costPrice),
    },
    message: "ອັບເດດສິນຄ້າສຳເລັດ",
  };
});

