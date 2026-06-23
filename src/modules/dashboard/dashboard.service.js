import prisma from '../../config/database.js';
import dayjs from 'dayjs';

export const getDashboardStats = async (user) => {
  const { role, id: userId } = user;

  if (role === 'ADMIN') {
    const totalNurseries = await prisma.nursery.count();
    const totalExporters = await prisma.user.count({
      where: { role: { name: 'EXPORTER' } },
    });
    
    const inventorySum = await prisma.inventoryBatch.aggregate({
      _sum: { quantity: true },
    });
    
    const totalReservations = await prisma.reservation.count();
    const totalProcurementOrders = await prisma.procurementOrder.count();

    const revenueSum = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: 'COMPLETED' },
    });

    return {
      totalNurseries,
      totalExporters,
      totalInventory: inventorySum._sum.quantity || 0,
      totalReservations,
      totalProcurementOrders,
      revenue: parseFloat(revenueSum._sum.amount || 0),
    };
  }

  if (role === 'EXPORTER') {
    const activeOrders = await prisma.procurementOrder.count({
      where: {
        exporterId: userId,
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    });

    const pendingReservations = await prisma.reservation.count({
      where: {
        exporterId: userId,
        status: 'PENDING',
      },
    });

    const trips = await prisma.trip.count({
      where: { exporterId: userId },
    });

    const collections = await prisma.collection.count({
      where: {
        tripStop: {
          trip: { exporterId: userId },
        },
      },
    });

    return {
      activeOrders,
      pendingReservations,
      trips,
      collections,
    };
  }

  if (role === 'FARMER') {
    const inventorySum = await prisma.inventoryBatch.aggregate({
      _sum: { quantity: true },
      where: {
        nurseryBlock: {
          nursery: { farmerId: userId },
        },
      },
    });

    const reservationRequests = await prisma.reservation.count({
      where: {
        status: 'PENDING',
        plant: {
          inventoryBatches: {
            some: {
              nurseryBlock: {
                nursery: { farmerId: userId },
              },
            },
          },
        },
      },
    });

    const collectionsCount = await prisma.collection.count({
      where: {
        tripStop: {
          nursery: { farmerId: userId },
        },
      },
    });

    return {
      inventoryCount: inventorySum._sum.quantity || 0,
      reservationRequests,
      collections: collectionsCount,
    };
  }

  if (role === 'SUPERVISOR') {
    const supervisor = await prisma.supervisor.findUnique({
      where: { userId },
    });

    if (!supervisor) {
      return { todayTrips: 0, pendingCollections: 0 };
    }

    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const todayTrips = await prisma.trip.count({
      where: {
        supervisorId: supervisor.id,
        departureDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const pendingCollections = await prisma.tripStop.count({
      where: {
        trip: {
          supervisorId: supervisor.id,
        },
        status: { in: ['PENDING', 'ARRIVED'] },
      },
    });

    return {
      todayTrips,
      pendingCollections,
    };
  }

  return {};
};
