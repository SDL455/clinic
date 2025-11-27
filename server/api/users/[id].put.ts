import { prisma } from "../../utils/prisma";
import { requireAdmin, hashPassword } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(event.context.params?.id || "");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດຜູ້ໃຊ້ບໍ່ຖືກຕ້ອງ",
    });
  }

  const updateData: {
    username?: string;
    password?: string;
    name?: string;
    role?: "ADMIN" | "EMPLOYEE";
    isActive?: boolean;
  } = {};

  if (body.username) updateData.username = body.username;
  if (body.name) updateData.name = body.name;
  if (body.role) updateData.role = body.role;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.password) updateData.password = await hashPassword(body.password);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
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
    message: "ອັບເດດຜູ້ໃຊ້ສຳເລັດ",
  };
});

