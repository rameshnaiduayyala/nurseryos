import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.nurseryBlock.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.nurseryBlock.findMany();
};

export const getById = async (id) => {
  const record = await prisma.nurseryBlock.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('nurseryBlock not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.nurseryBlock.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('nurseryBlock not found');
  return prisma.nurseryBlock.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.nurseryBlock.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('nurseryBlock not found');
  return prisma.nurseryBlock.delete({ where: { id } });
};
