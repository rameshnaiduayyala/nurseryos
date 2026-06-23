import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const createReservation = async (data, exporterId) => {
  const { plantId, quantity, expiresAt } = data;

  // Verify plant exists
  const plant = await prisma.plant.findUnique({ where: { id: plantId } });
  if (!plant) {
    throw ApiError.notFound('Plant not found');
  }

  // Use transaction to hold stock
  const reservation = await prisma.$transaction(async (tx) => {
    // Find available inventory batches for this plant
    const batches = await tx.inventoryBatch.findMany({
      where: {
        plantId,
        availableQuantity: { gte: 0 },
        status: 'AVAILABLE',
      },
      orderBy: { createdAt: 'asc' }, // FIFO queue
    });

    const totalAvailable = batches.reduce((sum, b) => sum + b.availableQuantity, 0);
    if (totalAvailable < quantity) {
      throw ApiError.badRequest(`Insufficient inventory. Available: ${totalAvailable}, Requested: ${quantity}`);
    }

    // Create reservation
    const newReservation = await tx.reservation.create({
      data: {
        exporterId,
        plantId,
        quantity,
        status: 'PENDING',
        expiresAt: new Date(expiresAt),
      },
    });

    // Allocate stock across batches and log transactions
    let remainingToReserve = quantity;
    for (const batch of batches) {
      if (remainingToReserve <= 0) break;

      const take = Math.min(batch.availableQuantity, remainingToReserve);
      
      const newAvail = batch.availableQuantity - take;

      await tx.inventoryBatch.update({
        where: { id: batch.id },
        data: {
          availableQuantity: newAvail,
          status: newAvail === 0 ? 'DEPLETED' : 'AVAILABLE',
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryBatchId: batch.id,
          reservationId: newReservation.id,
          type: 'RESERVED',
          quantity: take,
          description: `Reserved ${take} plants for Reservation: ${newReservation.id}`,
        },
      });

      remainingToReserve -= take;
    }

    return newReservation;
  });

  return reservation;
};

export const updateReservationStatus = async (id, status, user) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      plant: true,
      inventoryTransactions: true,
    },
  });

  if (!reservation) {
    throw ApiError.notFound('Reservation not found');
  }

  if (reservation.status === 'COLLECTED' || reservation.status === 'EXPIRED') {
    throw ApiError.badRequest(`Cannot modify reservation in '${reservation.status}' state`);
  }

  return prisma.$transaction(async (tx) => {
    if (status === 'APPROVED') {
      // Only farmer who owns the nursery of the inventory batch can approve
      if (user.role !== 'FARMER' && user.role !== 'ADMIN') {
        throw ApiError.forbidden('Only farmers or admins can approve reservations');
      }
      
      // Update status
      return tx.reservation.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
    }

    if (status === 'CANCELLED') {
      // Farmer or Exporter can cancel
      if (user.role === 'EXPORTER' && reservation.exporterId !== user.id) {
        throw ApiError.forbidden('You are not authorized to cancel this reservation');
      }

      // Restore inventory and write transaction logs
      for (const log of reservation.inventoryTransactions) {
        const batch = await tx.inventoryBatch.findUnique({ where: { id: log.inventoryBatchId } });
        if (batch) {
          const newAvail = batch.availableQuantity + log.quantity;
          await tx.inventoryBatch.update({
            where: { id: batch.id },
            data: {
              availableQuantity: newAvail,
              status: 'AVAILABLE', // Re-mark available since we added quantity back
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              inventoryBatchId: batch.id,
              reservationId: reservation.id,
              type: 'RELEASED',
              quantity: log.quantity,
              description: `Released ${log.quantity} plants from cancelled Reservation: ${reservation.id}`,
            },
          });
        }
      }

      return tx.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    }

    throw ApiError.badRequest('Invalid status update');
  });
};

export const getReservations = async (user) => {
  const where = {};

  if (user.role === 'EXPORTER') {
    where.exporterId = user.id;
  } else if (user.role === 'FARMER') {
    // Show reservations containing plants produced in farmer's nurseries
    where.plant = {
      inventoryBatches: {
        some: {
          nurseryBlock: {
            nursery: { farmerId: user.id },
          },
        },
      },
    };
  }

  return prisma.reservation.findMany({
    where,
    include: {
      exporter: { select: { id: true, fullName: true, email: true } },
      plant: { include: { category: true, variety: true, bagSize: true } },
    },
  });
};

export const getReservationById = async (id, user) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      exporter: { select: { id: true, fullName: true, email: true } },
      plant: { include: { category: true, variety: true, bagSize: true } },
    },
  });

  if (!reservation) {
    throw ApiError.notFound('Reservation not found');
  }

  if (user.role === 'EXPORTER' && reservation.exporterId !== user.id) {
    throw ApiError.forbidden('Forbidden to view this reservation');
  }

  return reservation;
};
