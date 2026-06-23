import prisma from '../../config/database.js';
import logger from '../../config/logger.js';

/**
 * Checks for expired reservations and releases their locked inventory stock.
 */
export const checkExpiredReservations = async () => {
  try {
    const now = new Date();

    // Find all active reservations that have expired
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['PENDING', 'APPROVED'] },
        expiresAt: { lt: now },
      },
      include: {
        inventoryTransactions: {
          where: { type: 'RESERVED' },
        },
      },
    });

    if (expiredReservations.length === 0) {
      return;
    }

    logger.info(`Found ${expiredReservations.length} expired reservations to release.`);

    for (const res of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        // 1. Update reservation status
        await tx.reservation.update({
          where: { id: res.id },
          data: { status: 'EXPIRED' },
        });

        // 2. Release stock for each reservation log
        for (const log of res.inventoryTransactions) {
          const batch = await tx.inventoryBatch.findUnique({
            where: { id: log.inventoryBatchId },
          });

          if (batch) {
            const newAvail = batch.availableQuantity + log.quantity;

            await tx.inventoryBatch.update({
              where: { id: batch.id },
              data: {
                availableQuantity: newAvail,
                status: 'AVAILABLE', // Re-mark available
              },
            });

            // Log releasing transaction
            await tx.inventoryTransaction.create({
              data: {
                inventoryBatchId: batch.id,
                reservationId: res.id,
                type: 'RELEASED',
                quantity: log.quantity,
                description: `Released ${log.quantity} plants due to Reservation expiration.`,
              },
            });
          }
        }

        logger.info(`Released locked stock for expired Reservation: ${res.id}`);
      });
    }
  } catch (error) {
    logger.error('Error running checkExpiredReservations daemon cycle:', error);
  }
};

/**
 * Starts the polling timer daemon to run the expiry checks at specified intervals
 * 
 * @param {number} intervalMs Execution interval in milliseconds (default 5 minutes)
 */
export const startReservationDaemon = (intervalMs = 5 * 60 * 1000) => {
  logger.info('Starting Auto-Expiring Reservations Daemon...');
  
  // Run once immediately on start
  checkExpiredReservations();

  const intervalId = setInterval(checkExpiredReservations, intervalMs);

  // Return trigger info for stopping if needed
  return () => clearInterval(intervalId);
};
