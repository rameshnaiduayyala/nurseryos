import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import { optimizeRoute, calculateDistanceKm } from '../../integrations/openroute.js';

export const createTrip = async (data, exporterId) => {
  const { vehicleId, driverId, supervisorId, departureDate, stops } = data;

  // Validate existence
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) throw ApiError.notFound('Driver not found');

  const supervisor = await prisma.supervisor.findUnique({ where: { id: supervisorId } });
  if (!supervisor) throw ApiError.notFound('Supervisor not found');

  // Fetch coordinates for each stop nursery to perform route optimization
  const stopsWithCoords = [];
  for (const stop of stops) {
    const nursery = await prisma.nursery.findUnique({
      where: { id: stop.nurseryId },
      select: { id: true, latitude: true, longitude: true, name: true },
    });
    
    if (!nursery) {
      throw ApiError.notFound(`Nursery ID ${stop.nurseryId} in stop not found`);
    }

    stopsWithCoords.push({
      nurseryId: nursery.id,
      latitude: nursery.latitude || 45.0, // fallback
      longitude: nursery.longitude || -122.0, // fallback
      originalRequestOrder: stop.stopOrder,
    });
  }

  // Optimize route starting from exporter yard (e.g. 45.0, -122.0)
  const startingPoint = { latitude: 45.0, longitude: -122.0 };
  const optimizedStops = optimizeRoute(stopsWithCoords, startingPoint);

  const trip = await prisma.$transaction(async (tx) => {
    const newTrip = await tx.trip.create({
      data: {
        exporterId,
        vehicleId,
        driverId,
        supervisorId,
        status: 'PLANNED',
        departureDate: new Date(departureDate),
        stops: {
          create: optimizedStops.map((stop, idx) => ({
            nurseryId: stop.nurseryId,
            stopOrder: idx + 1, // Re-indexed in optimized order
            status: 'PENDING',
          })),
        },
      },
      include: {
        stops: true,
      },
    });

    // Mark vehicle and driver as active/trip-assigned
    await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'ACTIVE' } });
    await tx.driver.update({ where: { id: driverId }, data: { status: 'ON_TRIP' } });

    return newTrip;
  });

  return trip;
};

export const updateTripStatus = async (id, status, user) => {
  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  if (user.role === 'SUPERVISOR' && trip.supervisorId !== user.id) {
    const supervisor = await prisma.supervisor.findUnique({ where: { userId: user.id } });
    if (!supervisor || trip.supervisorId !== supervisor.id) {
      throw ApiError.forbidden('You are not the supervisor assigned to this trip');
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.trip.update({
      where: { id },
      data: { status },
      include: { stops: true },
    });

    if (status === 'COMPLETED' || status === 'CANCELLED') {
      // Release vehicle and driver
      await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: 'AVAILABLE' } });
      await tx.driver.update({ where: { id: trip.driverId }, data: { status: 'AVAILABLE' } });
    }

    return updated;
  });
};

export const getTrips = async (user) => {
  const where = {};

  if (user.role === 'EXPORTER') {
    where.exporterId = user.id;
  } else if (user.role === 'SUPERVISOR') {
    const supervisor = await prisma.supervisor.findUnique({ where: { userId: user.id } });
    if (supervisor) {
      where.supervisorId = supervisor.id;
    } else {
      return [];
    }
  } else if (user.role === 'FARMER') {
    where.stops = {
      some: {
        nursery: { farmerId: user.id },
      },
    };
  }

  return prisma.trip.findMany({
    where,
    include: {
      exporter: { select: { id: true, fullName: true, email: true } },
      vehicle: true,
      driver: { include: { user: { select: { fullName: true } } } },
      supervisor: { include: { user: { select: { fullName: true } } } },
      stops: { include: { nursery: true } },
    },
  });
};

export const getTripById = async (id, user) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      exporter: { select: { id: true, fullName: true, email: true } },
      vehicle: true,
      driver: { include: { user: { select: { fullName: true } } } },
      supervisor: { include: { user: { select: { fullName: true } } } },
      stops: { include: { nursery: true, collections: { include: { plant: true } } } },
    },
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }

  if (user.role === 'SUPERVISOR') {
    const supervisor = await prisma.supervisor.findUnique({ where: { userId: user.id } });
    if (!supervisor || trip.supervisorId !== supervisor.id) {
      throw ApiError.forbidden('Forbidden to view this trip');
    }
  }

  return trip;
};
