import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດບໍລິການບໍ່ຖືກຕ້ອງ",
    });
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      isActive: body.isActive,
    },
  });

  return {
    success: true,
    data: {
      ...service,
      price: Number(service.price),
    },
    message: "ອັບເດດບໍລິການສຳເລັດ",
  };
});

