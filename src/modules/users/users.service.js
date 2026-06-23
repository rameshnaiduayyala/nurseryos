import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.user.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.user.findMany({
    include: { role: true }
  });
};

export const getById = async (id) => {
  const record = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });
  if (!record) throw ApiError.notFound('user not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.user.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('user not found');
  return prisma.user.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.user.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('user not found');
  return prisma.user.delete({ where: { id } });
};
