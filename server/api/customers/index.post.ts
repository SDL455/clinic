import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const body = await readBody(event);

  if (!body.firstName || !body.lastName || !body.phone) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່, ນາມສະກຸນ ແລະ ເບີໂທ",
    });
  }

  // Check if phone exists
  const existing = await prisma.customer.findUnique({
    where: { phone: body.phone },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: "ເບີໂທນີ້ມີໃນລະບົບແລ້ວ - ລູກຄ້າເກົ່າ",
    });
  }

  const customer = await prisma.customer.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      address: body.address || null,
    },
  });

  return {
    success: true,
    data: customer,
    message: "ເພີ່ມລູກຄ້າສຳເລັດ",
  };
});

