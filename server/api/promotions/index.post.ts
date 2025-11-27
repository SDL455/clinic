import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);

  if (!body.name || !body.discount || !body.startDate || !body.endDate) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ",
    });
  }

  const promotion = await prisma.promotion.create({
    data: {
      name: body.name,
      description: body.description || null,
      discount: body.discount,
      isPercent: body.isPercent || false,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  });

  return {
    success: true,
    data: {
      ...promotion,
      discount: Number(promotion.discount),
    },
    message: "ເພີ່ມໂປຣໂມຊັ່ນສຳເລັດ",
  };
});

