import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດບໍລິການບໍ່ຖືກຕ້ອງ",
    });
  }

  // Soft delete
  await prisma.service.update({
    where: { id },
    data: { isActive: false },
  });

  return {
    success: true,
    message: "ລຶບບໍລິການສຳເລັດ",
  };
});

