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

  // Soft delete - set isActive to false
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  return {
    success: true,
    message: "ລຶບສິນຄ້າສຳເລັດ",
  };
});

