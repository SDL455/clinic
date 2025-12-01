import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Get the first contact info record
    let contactInfo = await prisma.contactInfo.findFirst();
    
    // Prepare the data
    const data = {
      phone: body.phone ? JSON.stringify(body.phone) : null,
      email: body.email || null,
      facebook: body.facebook || null,
      line: body.line || null,
      website: body.website || null,
      address: body.address || null,
      province: body.province || null,
      district: body.district || null,
      village: body.village || null,
      openingHours: body.openingHours ? JSON.stringify(body.openingHours) : null,
      mapUrl: body.mapUrl || null,
      description: body.description || null
    };

    if (contactInfo) {
      // Update existing
      contactInfo = await prisma.contactInfo.update({
        where: { id: contactInfo.id },
        data
      });
    } else {
      // Create new
      contactInfo = await prisma.contactInfo.create({
        data
      });
    }

    // Parse JSON fields for response
    const parsedContactInfo = {
      ...contactInfo,
      phone: contactInfo.phone ? JSON.parse(contactInfo.phone) : [],
      openingHours: contactInfo.openingHours ? JSON.parse(contactInfo.openingHours) : {}
    };

    return {
      success: true,
      data: parsedContactInfo,
      message: "ອັບເດດຂໍ້ມູນສຳເລັດແລ້ວ"
    };
  } catch (error) {
    console.error("Error updating contact info:", error);
    return {
      success: false,
      error: "ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້"
    };
  }
});
