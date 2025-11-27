import { prisma } from "../../utils/prisma";
import { requireAdmin, hashPassword } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const body = await readBody(event);

  if (!body.username || !body.password || !body.name) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ",
    });
  }

  // Check if username exists
  const existing = await prisma.user.findUnique({
    where: { username: body.username },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: "ຊື່ຜູ້ໃຊ້ນີ້ມີແລ້ວ",
    });
  }

  const hashedPassword = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: hashedPassword,
      name: body.name,
      role: body.role || "EMPLOYEE",
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    data: user,
    message: "ເພີ່ມຜູ້ໃຊ້ສຳເລັດ",
  };
});

