import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດປະເພດບໍ່ຖືກຕ້ອງ",
    });
  }

  // Check if category has products
  const productsCount = await prisma.product.count({
    where: { categoryId: id, isActive: true },
  });

  if (productsCount > 0) {
    throw createError({
      statusCode: 400,
      message: `ບໍ່ສາມາດລຶບໄດ້ ເພາະມີສິນຄ້າ ${productsCount} ລາຍການໃນປະເພດນີ້`,
    });
  }

  await prisma.productCategory.delete({
    where: { id },
  });

  return {
    success: true,
    message: "ລຶບປະເພດສຳເລັດ",
  };
});

