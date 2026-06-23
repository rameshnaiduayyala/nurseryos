import prisma from '../../config/database.js';

export const getReportSummary = async () => {
  const totalUsers = await prisma.user.count();
  const totalNurseries = await prisma.nursery.count();
  const totalPlants = await prisma.plant.count();
  const totalOrders = await prisma.procurementOrder.count();
  
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true
    },
    where: {
      paymentStatus: 'COMPLETED'
    }
  });

  return {
    totalUsers,
    totalNurseries,
    totalPlants,
    totalOrders,
    totalRevenueCompleted: totalRevenue._sum.amount || 0
  };
};

export const getFarmerLedger = async (userId, role) => {
  if (role === 'FARMER') {
    return prisma.farmerLedger.findMany({
      where: { farmerId: userId },
      orderBy: { createdAt: 'desc' }
    });
  } else if (role === 'ADMIN') {
    return prisma.farmerLedger.findMany({
      include: { farmer: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
  return [];
};

export const getCustomerLedger = async () => {
  return prisma.customerLedger.findMany({
    include: { customer: true },
    orderBy: { createdAt: 'desc' }
  });
};
