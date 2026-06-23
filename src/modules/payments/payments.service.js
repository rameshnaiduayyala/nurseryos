import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const create = async (data) => {
  const { invoiceId, amount, paymentMethod, transactionReference } = data;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { procurementOrder: true },
  });

  if (!invoice) {
    throw ApiError.notFound('Invoice not found');
  }

  const payment = await prisma.$transaction(async (tx) => {
    // 1. Create payment
    const newPayment = await tx.payment.create({
      data: {
        invoiceId,
        amount,
        paymentMethod,
        transactionReference,
        paymentStatus: 'COMPLETED',
      },
    });

    // 2. Update invoice amountPaid
    const newAmountPaid = parseFloat(invoice.amountPaid) + parseFloat(amount);
    const amountDue = parseFloat(invoice.amountDue);

    let status = 'PARTIALLY_PAID';
    if (newAmountPaid >= amountDue) {
      status = 'PAID';
    }

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        status,
      },
    });

    // 3. Credit Customer Ledger
    if (invoice.procurementOrder.customerId) {
      await tx.customerLedger.create({
        data: {
          customerId: invoice.procurementOrder.customerId,
          type: 'CREDIT',
          amount,
          description: `Payment received for Invoice: ${invoice.invoiceNumber}`,
          referenceId: newPayment.id,
        },
      });
    }

    return newPayment;
  });

  return payment;
};

export const getAll = async () => {
  return prisma.payment.findMany({
    include: { invoice: true },
  });
};

export const getById = async (id) => {
  const record = await prisma.payment.findUnique({
    where: { id },
    include: { invoice: true },
  });
  if (!record) throw ApiError.notFound('Payment not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.payment.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('Payment not found');
  return prisma.payment.update({
    where: { id },
    data,
  });
};

export const remove = async (id) => {
  const record = await prisma.payment.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('Payment not found');
  return prisma.payment.delete({ where: { id } });
};
