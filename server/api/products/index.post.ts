import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);

  // Validate required fields
  if (!body.name || !body.price || !body.categoryId) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ",
    });
  }

  // Create product
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: body.price,
      costPrice: body.costPrice || body.price,
      stock: body.stock || 0,
      minStock: body.minStock || 5,
      categoryId: body.categoryId,
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
    message: "ເພີ່ມສິນຄ້າສຳເລັດ",
  };
});

