import prisma from '../../config/database.js';
import ApiError from '../../common/helpers/api-error.js';
import bcrypt from 'bcryptjs';

export const create = async (data, extra = {}) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return prisma.invoice.create({
    data: { ...data, ...extra }
  });
};

export const getAll = async () => {
  return prisma.invoice.findMany();
};

export const getById = async (id) => {
  const record = await prisma.invoice.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('invoice not found');
  return record;
};

export const getFullById = async (id) => {
  const record = await prisma.invoice.findUnique({
    where: { id },
    include: {
      procurementOrder: {
        include: {
          customer: true,
          exporter: true,
          items: {
            include: { plant: true }
          }
        }
      }
    }
  });
  if (!record) throw ApiError.notFound('Invoice not found');
  return record;
};

export const update = async (id, data) => {
  const record = await prisma.invoice.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('invoice not found');
  return prisma.invoice.update({
    where: { id },
    data
  });
};

export const remove = async (id) => {
  const record = await prisma.invoice.findUnique({ where: { id } });
  if (!record) throw ApiError.notFound('invoice not found');
  return prisma.invoice.delete({ where: { id } });
};
