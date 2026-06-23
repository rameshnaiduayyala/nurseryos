import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.quotation.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.quotation.findMany();
};

export const getById = async (id) => {
  const record = await prisma.quotation.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('quotation not found');
  return record;
};

export const getFullById = async (id) => {
  const record = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      exporter: true
    }
  });
  if (!record) throw ApiError.notFound('Quotation not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.quotation.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('quotation not found');
  return prisma.quotation.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.quotation.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('quotation not found');
  return prisma.quotation.delete({ where: { id } });
};
