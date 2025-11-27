import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);

  if (!body.name || !body.unit) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່ ແລະ ໜ່ວຍ",
    });
  }

  // Check if name exists
  const existing = await prisma.productCategory.findUnique({
    where: { name: body.name },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: "ຊື່ປະເພດນີ້ມີແລ້ວ",
    });
  }

  const category = await prisma.productCategory.create({
    data: {
      name: body.name,
      unit: body.unit,
    },
  });

  return {
    success: true,
    data: category,
    message: "ເພີ່ມປະເພດສຳເລັດ",
  };
});

