import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

const includeNursery = {
  nursery: {
    select: {
      id: true,
      name: true,
      location: true,
      farmerId: true,
    },
  },
};

const ensureNurseryAccess = async (nurseryId, user) => {
  const nursery = await prisma.nursery.findUnique({ where: { id: nurseryId } });
  if (!nursery) throw ApiError.notFound('Nursery not found');

  if (user.role !== 'ADMIN' && nursery.farmerId !== user.id) {
    throw ApiError.forbidden('You can only manage blocks for your own nursery');
  }

  return nursery;
};

const ensureBlockAccess = async (id, user) => {
  const record = await prisma.nurseryBlock.findUnique({
    where: { id },
    include: includeNursery,
  });
  if (!record) throw ApiError.notFound('nurseryBlock not found');

  if (user.role !== 'ADMIN' && record.nursery.farmerId !== user.id) {
    throw ApiError.forbidden('You can only manage your own nursery blocks');
  }

  return record;
};

export const create = async (data, user) => {
  await ensureNurseryAccess(data.nurseryId, user);

  return prisma.nurseryBlock.create({
    data,
    include: includeNursery,
  });
};

export const getAll = async (user) => {
  const where = {};

  if (user.role === 'FARMER') {
    where.nursery = { farmerId: user.id };
  } else if (user.role !== 'ADMIN') {
    return [];
  }

  return prisma.nurseryBlock.findMany({
    where,
    include: includeNursery,
    orderBy: { createdAt: 'desc' },
  });
};

export const getById = async (id, user) => {
  return ensureBlockAccess(id, user);
};

export const update = async (id, data, user) => {
  await ensureBlockAccess(id, user);

  if (data.nurseryId) {
    await ensureNurseryAccess(data.nurseryId, user);
  }

  return prisma.nurseryBlock.update({
    where: { id },
    data,
    include: includeNursery,
  });
};

export const remove = async (id, user) => {
  await ensureBlockAccess(id, user);
  return prisma.nurseryBlock.delete({ where: { id } });
};
