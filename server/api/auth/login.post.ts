import { prisma } from "../../utils/prisma";
import { verifyPassword, generateToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.username || !body.password) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ",
    });
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { username: body.username },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    });
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError({
      statusCode: 401,
      message: "ບັນຊີຂອງທ່ານຖືກປິດການໃຊ້ງານ",
    });
  }

  // Verify password
  const isValid = await verifyPassword(body.password, user.password);

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    });
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      token,
    },
  };
});

