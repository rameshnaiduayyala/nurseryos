import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.supervisor.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.supervisor.findMany({
    include: { user: true }
  });
};

export const getById = async (id) => {
  const record = await prisma.supervisor.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!record) throw ApiError.notFound('supervisor not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.supervisor.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('supervisor not found');
  return prisma.supervisor.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.supervisor.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('supervisor not found');
  return prisma.supervisor.delete({ where: { id } });
};
