import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const createBatch = async (data, farmerId) => {
  // Validate nursery block and that the farmer owns it
  const block = await prisma.nurseryBlock.findUnique({
    where: { id: data.nurseryBlockId },
    include: { nursery: true },
  });

  if (!block) {
    throw ApiError.notFound('Nursery block not found');
  }

  if (block.nursery.farmerId !== farmerId) {
    throw ApiError.forbidden('You do not own the nursery this block belongs to');
  }

  // Validate plant exists
  const plant = await prisma.plant.findUnique({ where: { id: data.plantId } });
  if (!plant) {
    throw ApiError.notFound('Plant not found');
  }

  // Use a transaction to ensure batch and transaction log are both written
  const batch = await prisma.$transaction(async (tx) => {
    const newBatch = await tx.inventoryBatch.create({
      data: {
        nurseryBlockId: data.nurseryBlockId,
        plantId: data.plantId,
        quantity: data.quantity,
        availableQuantity: data.quantity,
        unitPrice: data.unitPrice,
        status: 'AVAILABLE',
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        inventoryBatchId: newBatch.id,
        type: 'IN',
        quantity: data.quantity,
        description: 'Initial batch upload',
      },
    });

    return newBatch;
  });

  return batch;
};

export const updateBatch = async (batchId, data, farmerId) => {
  const batch = await prisma.inventoryBatch.findUnique({
    where: { id: batchId },
    include: { nurseryBlock: { include: { nursery: true } } },
  });

  if (!batch) {
    throw ApiError.notFound('Inventory batch not found');
  }

  if (batch.nurseryBlock.nursery.farmerId !== farmerId) {
    throw ApiError.forbidden('You are not authorized to update this inventory batch');
  }

  return prisma.$transaction(async (tx) => {
    let quantityDiff = 0;
    if (data.quantity !== undefined) {
      quantityDiff = data.quantity - batch.quantity;
    }

    const updated = await tx.inventoryBatch.update({
      where: { id: batchId },
      data: {
        ...data,
        ...(data.quantity !== undefined && {
          availableQuantity: batch.availableQuantity + quantityDiff,
        }),
      },
    });

    if (quantityDiff !== 0) {
      await tx.inventoryTransaction.create({
        data: {
          inventoryBatchId: batchId,
          type: quantityDiff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(quantityDiff),
          description: `Manual inventory adjustment by farmer`,
        },
      });
    }

    return updated;
  });
};

export const getInventory = async (user) => {
  const where = {};

  // If farmer, only show their own inventory batches
  if (user.role === 'FARMER') {
    where.nurseryBlock = {
      nursery: { farmerId: user.id },
    };
  }

  return prisma.inventoryBatch.findMany({
    where,
    include: {
      nurseryBlock: { include: { nursery: true } },
      plant: { include: { category: true, variety: true, bagSize: true } },
    },
  });
};

export const getBatchTransactions = async (batchId, user) => {
  const batch = await prisma.inventoryBatch.findUnique({
    where: { id: batchId },
    include: { nurseryBlock: { include: { nursery: true } } },
  });

  if (!batch) {
    throw ApiError.notFound('Inventory batch not found');
  }

  if (user.role === 'FARMER' && batch.nurseryBlock.nursery.farmerId !== user.id) {
    throw ApiError.forbidden('Forbidden to view transactions of this batch');
  }

  return prisma.inventoryTransaction.findMany({
    where: { inventoryBatchId: batchId },
    orderBy: { createdAt: 'desc' },
  });
};
