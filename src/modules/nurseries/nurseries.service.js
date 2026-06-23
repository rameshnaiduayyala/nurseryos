import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import logger from '../../config/logger.js';

export const createNursery = async (data, farmerId) => {
  const nursery = await prisma.nursery.create({
    data: {
      name: data.name,
      location: data.location,
      address: data.address,
      gst: data.gst,
      contactPerson: data.contactPerson,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      farmerId,
      isApproved: false, // Default false until Admin approves
    },
  });
  return nursery;
};

export const approveNursery = async (nurseryId, isApproved) => {
  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });
  if (!nursery) {
    throw ApiError.notFound('Nursery not found');
  }

  const updatedNursery = await prisma.nursery.update({
    where: { id: nurseryId },
    data: { isApproved },
  });

  if (isApproved && nursery.farmerId) {
    await prisma.user.update({
      where: { id: nursery.farmerId },
      data: { isActive: true },
    });
  }

  return updatedNursery;
};

export const getNurseries = async (user) => {
  const { role, id: userId } = user;

  if (role === 'ADMIN') {
    return prisma.nursery.findMany({
      include: { farmer: { select: { id: true, fullName: true, email: true } } },
    });
  }

  if (role === 'FARMER') {
    return prisma.nursery.findMany({
      where: { farmerId: userId },
    });
  }

  if (role === 'EXPORTER' || role === 'SUPERVISOR') {
    return prisma.nursery.findMany({
      where: { isApproved: true },
    });
  }

  return [];
};

export const getNearbyNurseries = async (latStr, lngStr, radiusKmStr) => {
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radiusKm = parseFloat(radiusKmStr || 50); // Default 50km

  if (isNaN(lat) || isNaN(lng)) {
    throw ApiError.badRequest('Latitude and Longitude must be valid numbers');
  }

  try {
    // Attempt PostGIS query
    const radiusMeters = radiusKm * 1000;
    const nearby = await prisma.$queryRaw`
      SELECT id, name, location, address, "contact_person" as "contactPerson", latitude, longitude, "is_approved" as "isApproved",
             ST_DistanceSphere(
               ST_MakePoint(longitude, latitude),
               ST_MakePoint(${lng}, ${lat})
             ) / 1000 as distance
      FROM nurseries
      WHERE "is_approved" = true
        AND ST_DistanceSphere(
              ST_MakePoint(longitude, latitude),
              ST_MakePoint(${lng}, ${lat})
            ) <= ${radiusMeters}
      ORDER BY distance ASC
    `;
    return nearby;
  } catch (error) {
    logger.warn('PostGIS query failed or ST_DistanceSphere is unavailable. Falling back to spherical law of cosines.', error);
    
    // Fallback using Spherical Law of Cosines
    const nearbyFallback = await prisma.$queryRaw`
      SELECT id, name, location, address, "contact_person" as "contactPerson", latitude, longitude, "is_approved" as "isApproved",
             (6371 * acos(
               cos(radians(${lat})) * cos(radians(latitude)) *
               cos(radians(longitude) - radians(${lng})) +
               sin(radians(${lat})) * sin(radians(latitude))
             )) as distance
      FROM nurseries
      WHERE "is_approved" = true
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND (6371 * acos(
               cos(radians(${lat})) * cos(radians(latitude)) *
               cos(radians(longitude) - radians(${lng})) +
               sin(radians(${lat})) * sin(radians(latitude))
             )) <= ${radiusKm}
      ORDER BY distance ASC
    `;
    return nearbyFallback;
  }
};

export const getNurseryById = async (nurseryId, user) => {
  const nursery = await prisma.nursery.findUnique({
    where: { id: nurseryId },
    include: {
      blocks: true,
      farmer: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!nursery) {
    throw ApiError.notFound('Nursery not found');
  }

  // Permission checks
  if (user.role === 'FARMER' && nursery.farmerId !== user.id) {
    throw ApiError.forbidden('You can only view your own nursery');
  }

  if ((user.role === 'EXPORTER' || user.role === 'SUPERVISOR') && !nursery.isApproved) {
    throw ApiError.forbidden('This nursery is not approved yet');
  }

  return nursery;
};

export const updateNursery = async (nurseryId, data, user) => {
  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });
  if (!nursery) {
    throw ApiError.notFound('Nursery not found');
  }

  if (user.role !== 'ADMIN' && nursery.farmerId !== user.id) {
    throw ApiError.forbidden('You are not authorized to update this nursery');
  }

  const updatedNursery = await prisma.nursery.update({
    where: { id: nurseryId },
    data: {
      ...data,
      ...(data.latitude && { latitude: parseFloat(data.latitude) }),
      ...(data.longitude && { longitude: parseFloat(data.longitude) }),
    },
  });

  return updatedNursery;
};

export const deleteNursery = async (nurseryId, user) => {
  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });
  if (!nursery) {
    throw ApiError.notFound('Nursery not found');
  }

  if (user.role !== 'ADMIN' && nursery.farmerId !== user.id) {
    throw ApiError.forbidden('You are not authorized to delete this nursery');
  }

  await prisma.nursery.delete({ where: { id: nurseryId } });
};
