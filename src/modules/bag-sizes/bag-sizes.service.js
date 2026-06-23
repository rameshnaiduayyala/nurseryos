import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.bagSize.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.bagSize.findMany();
};

export const getById = async (id) => {
  const record = await prisma.bagSize.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('bagSize not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.bagSize.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('bagSize not found');
  return prisma.bagSize.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.bagSize.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('bagSize not found');
  return prisma.bagSize.delete({ where: { id } });
};
