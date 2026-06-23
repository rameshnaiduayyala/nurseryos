import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import logger from '../../config/logger.js';

const findNearbyNurseryIds = async (lat, lng, radiusKm) => {
  const radiusMeters = radiusKm * 1000;
  try {
    const nearby = await prisma.$queryRaw`
      SELECT id FROM nurseries
      WHERE "is_approved" = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND ST_DistanceSphere(
              ST_MakePoint(longitude, latitude),
              ST_MakePoint(${lng}, ${lat})
            ) <= ${radiusMeters}
      ORDER BY ST_DistanceSphere(
        ST_MakePoint(longitude, latitude),
        ST_MakePoint(${lng}, ${lat})
      ) ASC
    `;
    return nearby.map((row) => row.id);
  } catch (error) {
    logger.warn('PostGIS nearby nursery query failed, using spherical law of cosines fallback', error);
    const nearbyFallback = await prisma.$queryRaw`
      SELECT id,
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
    return nearbyFallback.map((row) => row.id);
  }
};

export const createPlant = async (data, farmerId) => {
  const category = await prisma.plantCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) throw ApiError.badRequest('Category does not exist');

  const variety = await prisma.plantVariety.findUnique({ where: { id: data.varietyId } });
  if (!variety) throw ApiError.badRequest('Variety does not exist');

  const bagSize = await prisma.bagSize.findUnique({ where: { id: data.bagSizeId } });
  if (!bagSize) throw ApiError.badRequest('Bag size does not exist');

  const heightStandard = await prisma.heightStandard.findUnique({ where: { id: data.heightStandardId } });
  if (!heightStandard) throw ApiError.badRequest('Height standard does not exist');

  const plant = await prisma.plant.create({
    data: {
      name: data.name,
      categoryId: data.categoryId,
      varietyId: data.varietyId,
      bagSizeId: data.bagSizeId,
      heightStandardId: data.heightStandardId,
      description: data.description,
      unitPrice: data.unitPrice,
      farmerId,
    },
    include: {
      category: true,
      variety: true,
      bagSize: true,
      heightStandard: true,
    },
  });

  return plant;
};

export const getPlants = async (filters, user) => {
  const where = {};
  const inventoryWhere = {};
  const plantIds = [];

  if (filters.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.varietyId) {
    where.varietyId = filters.varietyId;
  }
  if (filters.bagSizeId) {
    where.bagSizeId = filters.bagSizeId;
  }

  if (user && user.role === 'FARMER') {
    where.farmerId = user.id;
  }

  if (filters.nurseryId) {
    inventoryWhere.nurseryBlock = {
      nurseryId: filters.nurseryId,
    };
  }

  if (filters.location && filters.radiusKm) {
    const [latStr, lngStr] = filters.location.split(',').map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      const nearbyNurseryIds = await findNearbyNurseryIds(lat, lng, parseFloat(filters.radiusKm));
      inventoryWhere.nurseryBlock = {
        ...(inventoryWhere.nurseryBlock || {}),
        nurseryId: { in: nearbyNurseryIds },
      };
    }
  }

  if (filters.minAvailability !== undefined) {
    inventoryWhere.availableQuantity = { gte: parseInt(filters.minAvailability) };
  }

  if (Object.keys(inventoryWhere).length > 0) {
    const batches = await prisma.inventoryBatch.findMany({
      where: inventoryWhere,
      select: { plantId: true },
      distinct: ['plantId'],
    });
    plantIds.push(...batches.map((b) => b.plantId));
  }

  if (plantIds.length > 0) {
    where.id = { in: plantIds };
  }

  return prisma.plant.findMany({
    where,
    include: {
      category: true,
      variety: true,
      bagSize: true,
    },
  });
};

export const getSuggestions = async (query, limit, user) => {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const where = {
    name: {
      contains: query.trim(),
      mode: 'insensitive',
    },
  };

  const plants = await prisma.plant.findMany({
    where,
    take: limit,
    include: {
      farmer: {
        select: { id: true, fullName: true },
      },
      category: true,
      variety: true,
      bagSize: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return plants.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name,
    variety: p.variety?.name,
    bagSize: p.bagSize?.size,
    farmerName: p.farmer?.fullName || 'Global',
    isOwn: user && user.role === 'FARMER' && p.farmerId === user.id,
  }));
};

export const getPlantById = async (id) => {
  const plant = await prisma.plant.findUnique({
    where: { id },
    include: {
      category: true,
      variety: true,
      bagSize: true,
      heightStandard: true,
    },
  });

  if (!plant) {
    throw ApiError.notFound('Plant not found');
  }

  return plant;
};

export const updatePlant = async (id, data, userId, userRole) => {
  const plant = await prisma.plant.findUnique({ where: { id } });
  if (!plant) {
    throw ApiError.notFound('Plant not found');
  }

  if (userRole !== 'ADMIN' && plant.farmerId !== userId) {
    throw ApiError.forbidden('You can only update your own plants');
  }

  if (data.categoryId) {
    const category = await prisma.plantCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) throw ApiError.badRequest('Category does not exist');
  }
  if (data.varietyId) {
    const variety = await prisma.plantVariety.findUnique({ where: { id: data.varietyId } });
    if (!variety) throw ApiError.badRequest('Variety does not exist');
  }
  if (data.bagSizeId) {
    const bagSize = await prisma.bagSize.findUnique({ where: { id: data.bagSizeId } });
    if (!bagSize) throw ApiError.badRequest('Bag size does not exist');
  }
  if (data.heightStandardId) {
    const heightStandard = await prisma.heightStandard.findUnique({ where: { id: data.heightStandardId } });
    if (!heightStandard) throw ApiError.badRequest('Height standard does not exist');
  }

  return prisma.plant.update({
    where: { id },
    data,
    include: {
      category: true,
      variety: true,
      bagSize: true,
      heightStandard: true,
    },
  });
};

export const deletePlant = async (id, userId, userRole) => {
  const plant = await prisma.plant.findUnique({ where: { id } });
  if (!plant) {
    throw ApiError.notFound('Plant not found');
  }

  if (userRole !== 'ADMIN' && plant.farmerId !== userId) {
    throw ApiError.forbidden('You can only delete your own plants');
  }

  await prisma.plant.delete({ where: { id } });
};
