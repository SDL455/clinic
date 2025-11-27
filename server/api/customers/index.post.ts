import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາສົ່ງຂໍ້ມູນ",
    });
  }

  // Parse form data
  let firstName: string | undefined;
  let lastName: string | undefined;
  let phone: string | undefined;
  let age: number | undefined;
  let province: string | undefined;
  let district: string | undefined;
  let village: string | undefined;
  let imagePath: string | undefined;

  for (const field of formData) {
    if (field.name === "firstName" && field.data) {
      firstName = field.data.toString("utf-8");
    } else if (field.name === "lastName" && field.data) {
      lastName = field.data.toString("utf-8");
    } else if (field.name === "phone" && field.data) {
      phone = field.data.toString("utf-8");
    } else if (field.name === "age" && field.data) {
      const ageStr = field.data.toString("utf-8");
      age = ageStr ? parseInt(ageStr, 10) : undefined;
    } else if (field.name === "province" && field.data) {
      province = field.data.toString("utf-8");
    } else if (field.name === "district" && field.data) {
      district = field.data.toString("utf-8");
    } else if (field.name === "village" && field.data) {
      village = field.data.toString("utf-8");
    } else if (field.name === "image" && field.data && field.filename) {
      // Handle file upload
      const uploadDir = join(process.cwd(), "public", "uploads", "customers");
      
      // Ensure upload directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const ext = extname(field.filename);
      const filename = `customer-${Date.now()}${ext}`;
      const filePath = join(uploadDir, filename);

      // Write file
      await writeFile(filePath, field.data);

      imagePath = `/uploads/customers/${filename}`;
    }
  }

  // Validate required fields
  if (!firstName || !firstName.trim()) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່",
    });
  }

  if (!lastName || !lastName.trim()) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນນາມສະກຸນ",
    });
  }

  if (!phone || !phone.trim()) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນເບີໂທ",
    });
  }

  // Validate phone format (8-11 digits)
  const phoneDigits = phone.replace(/\s/g, "");
  if (!/^[0-9]{8,11}$/.test(phoneDigits)) {
    throw createError({
      statusCode: 400,
      message: "ເບີໂທຕ້ອງມີ 8-11 ຕົວເລກ",
    });
  }

  if (!age || isNaN(age) || age < 0 || age > 150) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນອາຍຸທີ່ຖືກຕ້ອງ (0-150 ປີ)",
    });
  }

  if (!province || !province.trim()) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາເລືອກແຂວງ",
    });
  }

  if (!district || !district.trim()) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາເລືອກເມືອງ",
    });
  }

  if (!village || !village.trim()) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່ບ້ານ",
    });
  }

  // Check if phone exists
  const existing = await prisma.customer.findUnique({
    where: { phone: phoneDigits },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      message: "ເບີໂທນີ້ມີໃນລະບົບແລ້ວ - ລູກຄ້າເກົ່າ",
    });
  }

  const customer = await prisma.customer.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phoneDigits,
      age: age,
      province: province.trim(),
      district: district.trim(),
      village: village.trim(),
      image: imagePath || null,
    },
  });

  return {
    success: true,
    data: customer,
    message: "ເພີ່ມລູກຄ້າສຳເລັດ",
  };
});

