import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.plantVariety.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.plantVariety.findMany({
    include: { category: true }
  });
};

export const getById = async (id) => {
  const record = await prisma.plantVariety.findUnique({
    where: { id },
    include: { category: true }
  });
  if (!record) throw ApiError.notFound('plantVariety not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.plantVariety.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('plantVariety not found');
  return prisma.plantVariety.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.plantVariety.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('plantVariety not found');
  return prisma.plantVariety.delete({ where: { id } });
};
