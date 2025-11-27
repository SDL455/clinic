import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "ຜູ້ດູແລລະບົບ",
      role: "ADMIN",
    },
  });
  console.log("✅ Created admin user:", admin.username);

  // Create employee user
  const employeePassword = await bcrypt.hash("employee123", 12);

  const employee = await prisma.user.upsert({
    where: { username: "employee" },
    update: {},
    create: {
      username: "employee",
      password: employeePassword,
      name: "ພະນັກງານ",
      role: "EMPLOYEE",
    },
  });
  console.log("✅ Created employee user:", employee.username);

  // Create product categories
  const categories = [
    { name: "ຢາເມັດ", unit: "ເມັດ" },
    { name: "ຢາແຜ່ນ", unit: "ແຜ່ນ" },
    { name: "ຢາສີດ", unit: "ອັນ" },
    { name: "ອຸປະກອນ", unit: "ຖົງ" },
    { name: "ເຄື່ອງສຳອາງ", unit: "ຂວດ" },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Created product categories");

  // Get category IDs
  const pillCategory = await prisma.productCategory.findFirst({
    where: { name: "ຢາເມັດ" },
  });

  const equipmentCategory = await prisma.productCategory.findFirst({
    where: { name: "ອຸປະກອນ" },
  });

  // Create sample products
  if (pillCategory && equipmentCategory) {
    const products = [
      {
        name: "Paracetamol 500mg",
        description: "ຢາແກ້ປວດ ແລະ ລົດໄຂ້",
        price: 5000,
        costPrice: 3000,
        stock: 100,
        minStock: 20,
        categoryId: pillCategory.id,
      },
      {
        name: "Amoxicillin 250mg",
        description: "ຢາຕ້ານເຊື້ອ",
        price: 8000,
        costPrice: 5000,
        stock: 50,
        minStock: 10,
        categoryId: pillCategory.id,
      },
      {
        name: "Vitamin C 1000mg",
        description: "ວິຕາມິນຊີ",
        price: 15000,
        costPrice: 10000,
        stock: 5,
        minStock: 10,
        categoryId: pillCategory.id,
      },
      {
        name: "ຖົງມື (ກ່ອງ 100 ອັນ)",
        description: "ຖົງມືໃຊ້ແລ້ວຖິ້ມ",
        price: 80000,
        costPrice: 50000,
        stock: 10,
        minStock: 5,
        categoryId: equipmentCategory.id,
      },
    ];

    for (const product of products) {
      const existing = await prisma.product.findFirst({
        where: { name: product.name },
      });
      if (!existing) {
        await prisma.product.create({ data: product });
      }
    }
    console.log("✅ Created sample products");
  }

  // Create sample services
  const services = [
    { name: "ກວດສຸຂະພາບ", description: "ກວດສຸຂະພາບທົ່ວໄປ", price: 100000 },
    { name: "ສັກຢາ", description: "ບໍລິການສັກຢາ", price: 20000 },
    { name: "ປິ່ນປົວບາດແຜ", description: "ເຮັດແຜ ແລະ ທຳຄວາມສະອາດ", price: 50000 },
    { name: "ກວດເລືອດ", description: "ກວດວິເຄາະເລືອດ", price: 150000 },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });
    if (!existing) {
      await prisma.service.create({ data: service });
    }
  }
  console.log("✅ Created sample services");

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { phone: "02012345678" },
    update: {},
    create: {
      firstName: "ສົມໃຈ",
      lastName: "ວົງສະຫວັນ",
      phone: "02012345678",
      address: "ບ້ານ ໜອງທາ, ເມືອງ ໄຊທານີ, ນະຄອນຫຼວງວຽງຈັນ",
    },
  });
  console.log("✅ Created sample customer:", customer.phone);

  // Create sample promotion
  const promotion = await prisma.promotion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "ເປີດຮ້ານໃໝ່",
      description: "ສ່ວນຫຼຸດພິເສດສຳລັບການເປີດຮ້ານໃໝ່",
      discount: 10,
      isPercent: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  console.log("✅ Created sample promotion:", promotion.name);

  console.log("\n🎉 Seeding completed!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin: username='admin', password='admin123'");
  console.log("   Employee: username='employee', password='employee123'");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

