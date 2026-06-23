import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(
      z.object({
        plantId: z.string().uuid('Invalid Plant ID'),
        quantity: z.number().int().positive('Quantity must be positive'),
        unitPrice: z.number().positive('Unit price must be positive'),
      })
    ).min(1, 'Order must contain at least one item'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
  }),
});
