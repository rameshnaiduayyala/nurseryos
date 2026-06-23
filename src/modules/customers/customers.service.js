import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.customer.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.customer.findMany();
};

export const getById = async (id) => {
  const record = await prisma.customer.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('customer not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.customer.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('customer not found');
  return prisma.customer.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.customer.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('customer not found');
  return prisma.customer.delete({ where: { id } });
};
