import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (data, exporterId) => {
  const { customerId, items } = data;

  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }
  }

  // Double check plants exist
  for (const item of items) {
    const plant = await prisma.plant.findUnique({ where: { id: item.plantId } });
    if (!plant) {
      throw ApiError.notFound(`Plant ID ${item.plantId} not found`);
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const order = await prisma.$transaction(async (tx) => {
    // Create the procurement order
    const newOrder = await tx.procurementOrder.create({
      data: {
        exporterId,
        customerId,
        totalAmount,
        status: 'SUBMITTED',
        items: {
          create: items.map((item) => ({
            plantId: item.plantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            status: 'PENDING',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Automatically generate invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days terms

    const uniqueInvoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    const invoice = await tx.invoice.create({
      data: {
        procurementOrderId: newOrder.id,
        invoiceNumber: uniqueInvoiceNumber,
        amountDue: totalAmount,
        amountPaid: 0.00,
        status: 'UNPAID',
        dueDate,
      },
    });

    // Ledger posting: Debit the customer ledger for invoice total
    if (customerId) {
      await tx.customerLedger.create({
        data: {
          customerId,
          type: 'DEBIT',
          amount: totalAmount,
          description: `Debit invoice generation for Invoice: ${invoice.invoiceNumber}`,
          referenceId: invoice.id,
        },
      });
    }

    return newOrder;
  });

  return order;
};

export const updateOrderStatus = async (id, status, user) => {
  const order = await prisma.procurementOrder.findUnique({ where: { id } });
  if (!order) {
    throw ApiError.notFound('Procurement order not found');
  }

  if (user.role === 'EXPORTER' && order.exporterId !== user.id) {
    throw ApiError.forbidden('You are not authorized to update this order');
  }

  return prisma.procurementOrder.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
};

export const getOrders = async (user) => {
  const where = {};

  if (user.role === 'EXPORTER') {
    where.exporterId = user.id;
  } else if (user.role === 'FARMER') {
    where.items = {
      some: {
        plant: {
          inventoryBatches: {
            some: {
              nurseryBlock: {
                nursery: { farmerId: user.id },
              },
            },
          },
        },
      },
    };
  }

  return prisma.procurementOrder.findMany({
    where,
    include: {
      exporter: { select: { id: true, fullName: true, email: true } },
      customer: true,
      items: { include: { plant: true } },
      invoices: true,
    },
  });
};

export const getOrderById = async (id, user) => {
  const order = await prisma.procurementOrder.findUnique({
    where: { id },
    include: {
      exporter: { select: { id: true, fullName: true, email: true } },
      customer: true,
      items: { include: { plant: true } },
      invoices: true,
    },
  });

  if (!order) {
    throw ApiError.notFound('Procurement order not found');
  }

  if (user.role === 'EXPORTER' && order.exporterId !== user.id) {
    throw ApiError.forbidden('Forbidden to view this order');
  }

  return order;
};
