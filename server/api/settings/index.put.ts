import { prisma } from "../../utils/prisma";
import { requireAdmin } from "../../utils/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

export default defineEventHandler(async (event) => {
  // Only admin can update settings
  await requireAdmin(event);

  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາສົ່ງຂໍ້ມູນ",
    });
  }

  // Parse form data
  let name: string | undefined;
  let subtitle: string | undefined;
  let logoPath: string | undefined;

  for (const field of formData) {
    if (field.name === "name" && field.data) {
      name = field.data.toString("utf-8");
    } else if (field.name === "subtitle" && field.data) {
      subtitle = field.data.toString("utf-8");
    } else if (field.name === "logo" && field.data && field.filename) {
      // Handle file upload
      const uploadDir = join(process.cwd(), "public", "uploads");
      
      // Ensure upload directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const ext = extname(field.filename);
      const filename = `clinic-logo-${Date.now()}${ext}`;
      const filePath = join(uploadDir, filename);

      // Write file
      await writeFile(filePath, field.data);

      logoPath = `/uploads/${filename}`;
    }
  }

  // Get existing settings or create new
  let settings = await prisma.clinicSettings.findFirst();

  if (settings) {
    // Update existing settings
    settings = await prisma.clinicSettings.update({
      where: { id: settings.id },
      data: {
        ...(name !== undefined && { name }),
        ...(subtitle !== undefined && { subtitle }),
        ...(logoPath !== undefined && { logo: logoPath }),
      },
    });
  } else {
    // Create new settings
    settings = await prisma.clinicSettings.create({
      data: {
        name: name || "ຄລີນິກ ສຸຂະພາບດີ",
        subtitle: subtitle || "ຜູ້ບໍລິການ",
        logo: logoPath,
      },
    });
  }

  return {
    success: true,
    data: settings,
    message: "ອັບເດດການຕັ້ງຄ່າສຳເລັດ",
  };
});

