import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດປະເພດບໍ່ຖືກຕ້ອງ",
    });
  }

  const category = await prisma.productCategory.update({
    where: { id },
    data: {
      name: body.name,
      unit: body.unit,
    },
  });

  return {
    success: true,
    data: category,
    message: "ອັບເດດປະເພດສຳເລັດ",
  };
});

