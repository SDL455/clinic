import { prisma } from "../../utils/prisma";

export default defineEventHandler(async () => {
  // Get or create default settings
  let settings = await prisma.clinicSettings.findFirst();

  if (!settings) {
    settings = await prisma.clinicSettings.create({
      data: {
        name: "ຄລີນິກ ສຸຂະພາບດີ",
        subtitle: "ຜູ້ບໍລິການ",
      },
    });
  }

  return {
    success: true,
    data: settings,
  };
});

