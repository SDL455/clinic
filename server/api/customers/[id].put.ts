import { prisma } from "../../utils/prisma";
import { requireAuth } from "../../utils/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  const id = parseInt(event.context.params?.id || "");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "ລະຫັດລູກຄ້າບໍ່ຖືກຕ້ອງ",
    });
  }

  // Get existing customer
  const existingCustomer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!existingCustomer) {
    throw createError({
      statusCode: 404,
      message: "ບໍ່ພົບລູກຄ້າ",
    });
  }

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

      // Delete old image if exists
      if (existingCustomer.image) {
        const oldImagePath = join(process.cwd(), "public", existingCustomer.image);
        if (existsSync(oldImagePath)) {
          try {
            await unlink(oldImagePath);
          } catch {
            // Ignore error if file doesn't exist
          }
        }
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

  // Validate required fields if provided
  if (firstName !== undefined && (!firstName || !firstName.trim())) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່",
    });
  }

  if (lastName !== undefined && (!lastName || !lastName.trim())) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນນາມສະກຸນ",
    });
  }

  if (phone !== undefined) {
    if (!phone || !phone.trim()) {
      throw createError({
        statusCode: 400,
        message: "ກະລຸນາປ້ອນເບີໂທ",
      });
    }

    // Validate phone format
    const phoneDigits = phone.replace(/\s/g, "");
    if (!/^[0-9]{8,11}$/.test(phoneDigits)) {
      throw createError({
        statusCode: 400,
        message: "ເບີໂທຕ້ອງມີ 8-11 ຕົວເລກ",
      });
    }

    // Check if phone is taken by another customer
    if (phoneDigits !== existingCustomer.phone) {
      const existing = await prisma.customer.findFirst({
        where: {
          phone: phoneDigits,
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
  }

  if (age !== undefined && (isNaN(age) || age < 0 || age > 150)) {
    throw createError({
      statusCode: 400,
      message: "ອາຍຸຕ້ອງລະຫວ່າງ 0-150 ປີ",
    });
  }

  if (province !== undefined && (!province || !province.trim())) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາເລືອກແຂວງ",
    });
  }

  if (district !== undefined && (!district || !district.trim())) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາເລືອກເມືອງ",
    });
  }

  if (village !== undefined && (!village || !village.trim())) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາປ້ອນຊື່ບ້ານ",
    });
  }

  // Prepare update data
  const updateData: any = {};
  
  if (firstName !== undefined) {
    updateData.firstName = firstName.trim();
  }
  if (lastName !== undefined) {
    updateData.lastName = lastName.trim();
  }
  if (phone !== undefined) {
    updateData.phone = phone.replace(/\s/g, "");
  }
  if (age !== undefined) {
    updateData.age = age;
  }
  if (province !== undefined) {
    updateData.province = province.trim();
  }
  if (district !== undefined) {
    updateData.district = district.trim();
  }
  if (village !== undefined) {
    updateData.village = village.trim();
  }
  if (imagePath !== undefined) {
    updateData.image = imagePath;
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: updateData,
  });

  return {
    success: true,
    data: customer,
    message: "ອັບເດດລູກຄ້າສຳເລັດ",
  };
});

