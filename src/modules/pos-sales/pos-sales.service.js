import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const createPosSale = async (data, farmerId) => {
  const { nurseryId, customerName, customerPhone, paymentMethod, paymentStatus, items } = data;

  // Verify nursery existence and ownership
  const nursery = await prisma.nursery.findUnique({
    where: { id: nurseryId },
  });

  if (!nursery) {
    throw ApiError.notFound('Nursery not found');
  }

  if (nursery.farmerId !== farmerId) {
    throw ApiError.forbidden('You do not own this nursery to perform POS transactions');
  }

  // Pre-calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const receiptNumber = `REC-POS-${Date.now()}`;

  // Run transaction to write POS sale and deduct inventory
  const sale = await prisma.$transaction(async (tx) => {
    // 1. Create the Sale
    const newSale = await tx.posSale.create({
      data: {
        farmerId,
        nurseryId,
        customerName,
        customerPhone,
        totalAmount,
        paymentMethod,
        paymentStatus,
        receiptNumber,
        items: {
          create: items.map((item) => ({
            plantId: item.plantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { plant: true } },
      },
    });

    // 2. Perform Stock Deductions for each item
    for (const item of items) {
      // Find batches with quantity > 0 for this plant in this nursery
      const batches = await tx.inventoryBatch.findMany({
        where: {
          plantId: item.plantId,
          quantity: { gt: 0 },
          nurseryBlock: { nurseryId },
        },
        orderBy: { createdAt: 'asc' }, // FIFO
      });

      let remainingToDeduct = item.quantity;

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        const deduct = Math.min(batch.quantity, remainingToDeduct);
        const newQty = batch.quantity - deduct;
        const newAvail = Math.max(0, batch.availableQuantity - deduct);

        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            quantity: newQty,
            availableQuantity: newAvail,
            status: newQty === 0 ? 'DEPLETED' : 'AVAILABLE',
          },
        });

        // Log transaction
        await tx.inventoryTransaction.create({
          data: {
            inventoryBatchId: batch.id,
            type: 'OUT',
            quantity: deduct,
            description: `POS Retail Sale: ${receiptNumber}`,
          },
        });

        remainingToDeduct -= deduct;
      }

      if (remainingToDeduct > 0) {
        // If stock is insufficient, log an overdraft transaction or throw an error.
        // For POS, we allow it (retailers sometimes oversell physically before updating systems) but log an audit log.
        const firstBlock = await tx.nurseryBlock.findFirst({ where: { nurseryId } });
        if (firstBlock) {
          const overdraftBatch = await tx.inventoryBatch.create({
            data: {
              nurseryBlockId: firstBlock.id,
              plantId: item.plantId,
              quantity: 0,
              availableQuantity: 0,
              unitPrice: item.unitPrice,
              status: 'DEPLETED',
            },
          });
          await tx.inventoryTransaction.create({
            data: {
              inventoryBatchId: overdraftBatch.id,
              type: 'OUT',
              quantity: remainingToDeduct,
              description: `OVERDRAFT POS: Retail sale exceeded system records by ${remainingToDeduct}`,
            },
          });
        }
      }
    }

    return newSale;
  });

  return sale;
};

export const getPosSales = async (farmerId) => {
  return prisma.posSale.findMany({
    where: { farmerId },
    include: {
      items: { include: { plant: true } },
      nursery: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPosSaleById = async (id, farmerId) => {
  const sale = await prisma.posSale.findUnique({
    where: { id },
    include: {
      items: { include: { plant: true } },
      nursery: true,
      farmer: { select: { fullName: true } },
    },
  });

  if (!sale) {
    throw ApiError.notFound('POS Sale record not found');
  }

  if (sale.farmerId !== farmerId) {
    throw ApiError.forbidden('You are not authorized to access this sale receipt');
  }

  return sale;
};

export const generateHtmlReceipt = (sale) => {
  const dateStr = new Date(sale.createdAt).toLocaleString();
  const itemsHtml = sale.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 6px 0;">${item.plant.name}</td>
      <td style="text-align: center; padding: 6px 0;">${item.quantity}</td>
      <td style="text-align: right; padding: 6px 0;">₹${parseFloat(item.unitPrice).toFixed(2)}</td>
      <td style="text-align: right; padding: 6px 0;">₹${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${sale.receiptNumber}</title>
      <style>
        @media print {
          body { width: 80mm; margin: 0; padding: 0; font-family: 'Courier New', Courier, monospace; font-size: 12px; }
          .no-print { display: none; }
        }
        body {
          width: 80mm;
          margin: 20px auto;
          padding: 10px;
          border: 1px dashed #ccc;
          font-family: 'Courier New', Courier, monospace;
          font-size: 13px;
          color: #333;
        }
        .header { text-align: center; margin-bottom: 15px; }
        .header h2 { margin: 0 0 5px 0; font-size: 18px; }
        .info { margin-bottom: 15px; line-height: 1.4; }
        .info div { display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th { border-bottom: 1px dashed #333; border-top: 1px dashed #333; padding: 6px 0; text-align: left; }
        .total-section { border-top: 1px dashed #333; padding-top: 10px; line-height: 1.5; }
        .total-section div { display: flex; justify-content: space-between; font-weight: bold; }
        .footer { text-align: center; margin-top: 25px; font-size: 11px; }
        .btn-print {
          background-color: #4CAF50;
          color: white;
          padding: 8px 16px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 20px;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <button class="btn-print no-print" onclick="window.print()">Print Receipt</button>
      <div class="header">
        <h2>${sale.nursery.name}</h2>
        <div>${sale.nursery.address || sale.nursery.location}</div>
        ${sale.nursery.gst ? `<div>GST: ${sale.nursery.gst}</div>` : ''}
      </div>
      
      <div class="info">
        <div><span>Receipt #:</span> <span>${sale.receiptNumber}</span></div>
        <div><span>Date:</span> <span>${dateStr}</span></div>
        <div><span>Customer:</span> <span>${sale.customerName}</span></div>
        ${sale.customerPhone ? `<div><span>Phone:</span> <span>${sale.customerPhone}</span></div>` : ''}
        <div><span>Cashier:</span> <span>${sale.farmer.fullName}</span></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-section">
        <div><span>Subtotal:</span> <span>₹${parseFloat(sale.totalAmount).toFixed(2)}</span></div>
        <div><span>TOTAL:</span> <span>₹${parseFloat(sale.totalAmount).toFixed(2)}</span></div>
        <div style="font-weight: normal; font-size: 11px; margin-top: 5px;">
          <span>Payment:</span> <span>${sale.paymentMethod} (${sale.paymentStatus})</span>
        </div>
      </div>

      <div class="footer">
        *** Thank you for your purchase! ***<br>
        Powered by NurseryOS POS
      </div>
    </body>
    </html>
  `;
};
