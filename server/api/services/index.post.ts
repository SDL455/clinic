import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);

  if (!body.name || !body.price) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່ ແລະ ລາຄາ",
    });
  }

  const service = await prisma.service.create({
    data: {
      name: body.name,
      description: body.description || null,
      price: body.price,
    },
  });

  return {
    success: true,
    data: {
      ...service,
      price: Number(service.price),
    },
    message: "ເພີ່ມບໍລິການສຳເລັດ",
  };
});

