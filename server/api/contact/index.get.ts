import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get the first (and only) contact info record
    let contactInfo = await prisma.contactInfo.findFirst();
    
    // If no contact info exists, create a default one
    if (!contactInfo) {
      contactInfo = await prisma.contactInfo.create({
        data: {
          phone: JSON.stringify(["020 5555 5555", "030 5555 5555"]),
          email: "info@clinic.la",
          facebook: "https://facebook.com/clinic",
          line: "@clinic",
          website: "https://clinic.la",
          address: "ບ້ານ ສີສະຫວ່າງ, ເມືອງ ສີສະຫວ່າງ",
          province: "ນະຄອນຫຼວງວຽງຈັນ",
          district: "ສີສະຫວ່າງ",
          village: "ສີສະຫວ່າງ",
          openingHours: JSON.stringify({
            monday: "08:00 - 17:00",
            tuesday: "08:00 - 17:00",
            wednesday: "08:00 - 17:00",
            thursday: "08:00 - 17:00",
            friday: "08:00 - 17:00",
            saturday: "08:00 - 12:00",
            sunday: "ປິດ"
          }),
          mapUrl: "",
          description: "ຄລີນິກສຸຂະພາບດີ ໃຫ້ບໍລິການດ້ານສຸຂະພາບທີ່ມີຄຸນນະພາບດ້ວຍທີມງານມືອາຊີບ"
        }
      });
    }

    // Parse JSON fields
    const parsedContactInfo = {
      ...contactInfo,
      phone: contactInfo.phone ? JSON.parse(contactInfo.phone) : [],
      openingHours: contactInfo.openingHours ? JSON.parse(contactInfo.openingHours) : {}
    };

    return {
      success: true,
      data: parsedContactInfo
    };
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return {
      success: false,
      error: "ບໍ່ສາມາດດຶງຂໍ້ມູນຕິດຕໍ່ໄດ້"
    };
  }
});
