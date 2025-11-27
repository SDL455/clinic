import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດລູກຄ້າບໍ່ຖືກຕ້ອງ",
    });
  }

  // Check if phone is taken by another customer
  if (body.phone) {
    const existing = await prisma.customer.findFirst({
      where: {
        phone: body.phone,
        NOT: { id },
      },
    });

    if (existing) {
      throw createError({
        statusCode: 400,
        message: "ເບີໂທນີ້ມີໃນລະບົບແລ້ວ",
      });
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address,
    },
  });

  return {
    success: true,
    data: customer,
    message: "ອັບເດດລູກຄ້າສຳເລັດ",
  };
});

