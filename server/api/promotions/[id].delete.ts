import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດໂປຣໂມຊັ່ນບໍ່ຖືກຕ້ອງ",
    });
  }

  await prisma.promotion.update({
    where: { id },
    data: { isActive: false },
  });

  return {
    success: true,
    message: "ລຶບໂປຣໂມຊັ່ນສຳເລັດ",
  };
});

