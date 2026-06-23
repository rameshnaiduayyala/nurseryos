import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.driver.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.driver.findMany({
    include: { user: true }
  });
};

export const getById = async (id) => {
  const record = await prisma.driver.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!record) throw ApiError.notFound('driver not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.driver.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('driver not found');
  return prisma.driver.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.driver.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('driver not found');
  return prisma.driver.delete({ where: { id } });
};
