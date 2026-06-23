import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';

export const create = async (data) => {
  return prisma.heightStandard.create({ data });
};

export const getAll = async () => {
  return prisma.heightStandard.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getById = async (id) => {
  const record = await prisma.heightStandard.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('Height standard not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.heightStandard.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('Height standard not found');
  return prisma.heightStandard.update({
    where: { id },
    data,
  });
};

export const remove = async (id) => {
  const record = await prisma.heightStandard.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('Height standard not found');
  return prisma.heightStandard.delete({ where: { id } });
};
