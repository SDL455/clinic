import { prisma } from "../../utils/prisma";
import { requireAuth, generateInvoiceNumber } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);

  const body = await readBody(event);

  if (!body.customerId || !body.items || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      message: "ກະລຸນາເລືອກລູກຄ້າ ແລະ ສິນຄ້າ",
    });
  }

  // Start transaction
  const sale = await prisma.$transaction(async (tx) => {
    // Create sale
    const newSale = await tx.sale.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        customerId: body.customerId,
        userId: user.userId,
        promotionId: body.promotionId || null,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        total: body.total,
        status: body.status || "UNPAID",
        notes: body.notes || null,
      },
    });

    // Create sale items and update stock
    for (const item of body.items) {
      await tx.saleItem.create({
        data: {
          saleId: newSale.id,
          productId: item.type === "product" ? item.itemId : null,
          serviceId: item.type === "service" ? item.itemId : null,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        },
      });

      // Update product stock if it's a product
      if (item.type === "product") {
        await tx.product.update({
          where: { id: item.itemId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    }

    return newSale;
  });

  // Fetch complete sale data
  const completeSale = await prisma.sale.findUnique({
    where: { id: sale.id },
    include: {
      customer: true,
      user: { select: { id: true, name: true } },
      items: {
        include: {
          product: true,
          service: true,
        },
      },
    },
  });

  return {
    success: true,
    data: completeSale
      ? {
          ...completeSale,
          subtotal: Number(completeSale.subtotal),
          discount: Number(completeSale.discount),
          total: Number(completeSale.total),
          items: completeSale.items.map((item) => ({
            ...item,
            price: Number(item.price),
            total: Number(item.total),
          })),
        }
      : null,
    message: "ບັນທຶກການຂາຍສຳເລັດ",
  };
});

