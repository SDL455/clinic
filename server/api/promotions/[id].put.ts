import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດໂປຣໂມຊັ່ນບໍ່ຖືກຕ້ອງ",
    });
  }

  const promotion = await prisma.promotion.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      discount: body.discount,
      isPercent: body.isPercent,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      isActive: body.isActive,
    },
  });

  return {
    success: true,
    data: {
      ...promotion,
      discount: Number(promotion.discount),
    },
    message: "ອັບເດດໂປຣໂມຊັ່ນສຳເລັດ",
  };
});

