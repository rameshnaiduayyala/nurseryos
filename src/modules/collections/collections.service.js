import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const collectPlants = async (data, photoUrl, user) => {
  const { tripStopId, plantId, quantityCollected } = data;

  // Validate trip stop and check if supervisor is assigned
  const stop = await prisma.tripStop.findUnique({
    where: { id: tripStopId },
    include: { trip: true, nursery: true },
  });

  if (!stop) {
    throw ApiError.notFound('Trip stop not found');
  }

  const supervisor = await prisma.supervisor.findUnique({ where: { userId: user.id } });
  if (!supervisor || stop.trip.supervisorId !== supervisor.id) {
    throw ApiError.forbidden('You are not the supervisor assigned to this trip');
  }

  if (stop.status !== 'ARRIVED') {
    throw ApiError.badRequest('You must mark the stop as ARRIVED before collecting plants');
  }

  // Double check plant exists
  const plant = await prisma.plant.findUnique({ where: { id: plantId } });
  if (!plant) {
    throw ApiError.notFound('Plant not found');
  }

  // Deduct actual quantity from physical inventory batches in FIFO order
  const collection = await prisma.$transaction(async (tx) => {
    // Create collection record
    const newCollection = await tx.collection.create({
      data: {
        tripStopId,
        plantId,
        quantityCollected,
        photoUrl,
        status: 'COLLECTED',
        collectedAt: new Date(),
      },
    });

    // Find batches with quantity > 0 for this plant in the nursery associated with this stop
    const batches = await tx.inventoryBatch.findMany({
      where: {
        plantId,
        quantity: { gt: 0 },
        nurseryBlock: { nurseryId: stop.nurseryId },
      },
      orderBy: { createdAt: 'asc' },
    });

    let remainingToDeduct = quantityCollected;

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

      await tx.inventoryTransaction.create({
        data: {
          inventoryBatchId: batch.id,
          type: 'OUT',
          quantity: deduct,
          description: `Collected during Trip: ${stop.tripId}, Stop: ${stop.id}`,
        },
      });

      remainingToDeduct -= deduct;
    }

    if (remainingToDeduct > 0) {
      const firstBlock = await tx.nurseryBlock.findFirst({ where: { nurseryId: stop.nurseryId } });
      if (firstBlock) {
        const overdraftBatch = await tx.inventoryBatch.create({
          data: {
            nurseryBlockId: firstBlock.id,
            plantId,
            quantity: 0,
            availableQuantity: 0,
            unitPrice: plant.unitPrice,
            status: 'DEPLETED',
          },
        });
        await tx.inventoryTransaction.create({
          data: {
            inventoryBatchId: overdraftBatch.id,
            type: 'OUT',
            quantity: remainingToDeduct,
            description: `OVERDRAFT: Plant collection exceeded inventory records by ${remainingToDeduct}`,
          },
        });
      }
    }

    // Ledger posting: Credit the farmer who owns the nursery
    const totalPayoutValue = quantityCollected * parseFloat(plant.unitPrice);
    await tx.farmerLedger.create({
      data: {
        farmerId: stop.nursery.farmerId,
        type: 'CREDIT',
        amount: totalPayoutValue,
        description: `Credit payout for collecting ${quantityCollected}x ${plant.name}`,
        referenceId: newCollection.id,
      },
    });

    return newCollection;
  });

  return collection;
};

export const updateStopStatus = async (stopId, status, user) => {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: { trip: true },
  });

  if (!stop) {
    throw ApiError.notFound('Trip stop not found');
  }

  const supervisor = await prisma.supervisor.findUnique({ where: { userId: user.id } });
  if (!supervisor || stop.trip.supervisorId !== supervisor.id) {
    throw ApiError.forbidden('You are not the supervisor assigned to this trip');
  }

  const updateData = { status };
  if (status === 'ARRIVED') {
    updateData.arrivedAt = new Date();
  } else if (status === 'DEPARTED') {
    updateData.departedAt = new Date();
  }

  return prisma.tripStop.update({
    where: { id: stopId },
    data: updateData,
  });
};
