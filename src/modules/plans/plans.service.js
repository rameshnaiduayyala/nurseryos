import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import { calculateDistanceKm } from '../../integrations/openroute.js';

export const createPlan = async (data, exporterId) => {
  const { name, description, type, plannedDate, stops, notes } = data;

  if (!stops || stops.length === 0) {
    throw ApiError.badRequest('Plan must have at least one stop');
  }

  const plantTotalQuantity = stops.reduce((sum, stop) => sum + (stop.plannedQuantity || 0), 0);

  const plan = await prisma.$transaction(async (tx) => {
    const newPlan = await tx.operationalPlan.create({
      data: {
        exporterId,
        name,
        description,
        type: type || 'DELIVERY',
        plannedDate: plannedDate ? new Date(plannedDate) : null,
        notes,
        totalStops: stops.length,
        totalQuantity: plantTotalQuantity,
        stops: {
          create: stops.map((stop, idx) => ({
            nurseryId: stop.nurseryId,
            stopOrder: idx + 1,
            plannedQuantity: stop.plannedQuantity || 0,
            notes: stop.notes,
          })),
        },
      },
      include: {
        stops: {
          include: {
            nursery: {
              select: {
                id: true,
                name: true,
                location: true,
                address: true,
                contactPerson: true,
                mobileNumber: true,
                latitude: true,
                longitude: true,
                farmerId: true,
                farmer: {
                  select: { id: true, fullName: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    return newPlan;
  });

  return plan;
};

export const getPlans = async (user) => {
  const where = {};

  if (user.role === 'EXPORTER') {
    where.exporterId = user.id;
  } else if (user.role === 'FARMER') {
    where.stops = {
      some: {
        nursery: { farmerId: user.id },
      },
    };
  } else if (user.role === 'ADMIN') {
    where.status = { not: 'ARCHIVED' };
  } else {
    return [];
  }

  return prisma.operationalPlan.findMany({
    where,
    include: {
      exporter: {
        select: { id: true, fullName: true, email: true },
      },
      stops: {
        include: {
          nursery: {
            select: {
              id: true,
              name: true,
              location: true,
              address: true,
              contactPerson: true,
              mobileNumber: true,
              latitude: true,
              longitude: true,
              farmerId: true,
              farmer: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
        },
        orderBy: { stopOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getPlanById = async (id, user) => {
  const plan = await prisma.operationalPlan.findUnique({
    where: { id },
    include: {
      exporter: {
        select: { id: true, fullName: true, email: true },
      },
      stops: {
        include: {
          nursery: {
            select: {
              id: true,
              name: true,
              location: true,
              address: true,
              contactPerson: true,
              mobileNumber: true,
              latitude: true,
              longitude: true,
              farmerId: true,
              farmer: {
                select: { id: true, fullName: true, email: true },
              },
            },
          },
        },
        orderBy: { stopOrder: 'asc' },
      },
    },
  });

  if (!plan) {
    throw ApiError.notFound('Operational plan not found');
  }

  if (user.role === 'EXPORTER' && plan.exporterId !== user.id) {
    throw ApiError.forbidden('Forbidden to view this plan');
  }

  if (user.role === 'FARMER') {
    const hasFarmerStop = plan.stops.some(
      (stop) => stop.nursery.farmerId === user.id
    );
    if (!hasFarmerStop) {
      throw ApiError.forbidden('Forbidden to view this plan');
    }
  }

  return plan;
};

export const updatePlanStatus = async (id, status, user) => {
  const plan = await prisma.operationalPlan.findUnique({ where: { id } });

  if (!plan) {
    throw ApiError.notFound('Operational plan not found');
  }

  if (user.role === 'EXPORTER' && plan.exporterId !== user.id) {
    throw ApiError.forbidden('You are not authorized to update this plan');
  }

  const validTransitions = {
    DRAFT: ['ACTIVE', 'CANCELLED'],
    ACTIVE: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowed = validTransitions[plan.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot transition from '${plan.status}' to '${status}'`
    );
  }

  return prisma.operationalPlan.update({
    where: { id },
    data: { status },
    include: {
      stops: {
        include: {
          nursery: true,
        },
        orderBy: { stopOrder: 'asc' },
      },
    },
  });
};

export const updatePlanStopStatus = async (planId, stopId, status, user) => {
  const plan = await prisma.operationalPlan.findUnique({
    where: { id: planId },
    include: { stops: true },
  });

  if (!plan) {
    throw ApiError.notFound('Operational plan not found');
  }

  const stop = plan.stops.find((s) => s.id === stopId);
  if (!stop) {
    throw ApiError.notFound('Plan stop not found');
  }

  const data = { status };

  if (status === 'ARRIVED') {
    data.arrivedAt = new Date();
  } else if (status === 'DEPARTED') {
    data.departedAt = new Date();
  }

  const updated = await prisma.planStop.update({
    where: { id: stopId },
    data,
    include: {
      nursery: true,
      plan: {
        select: { id: true, name: true, status: true },
      },
    },
  });

  return updated;
};

export const getPlantAvailabilityForPlan = async (planId) => {
  const plan = await prisma.operationalPlan.findUnique({
    where: { id: planId },
    include: {
      stops: {
        include: {
          nursery: {
            include: {
              blocks: {
                include: {
                  inventoryBatches: {
                    where: { status: 'AVAILABLE' },
                    include: {
                      plant: {
                        include: {
                          category: true,
                          variety: true,
                          bagSize: true,
                          heightStandard: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { stopOrder: 'asc' },
      },
    },
  });

  if (!plan) {
    throw ApiError.notFound('Operational plan not found');
  }

  return plan;
};
