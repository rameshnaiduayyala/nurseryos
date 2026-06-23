import { z } from 'zod';

export const createBatchSchema = z.object({
  body: z.object({
    nurseryBlockId: z.string().uuid('Invalid Nursery Block ID'),
    plantId: z.string().uuid('Invalid Plant ID'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    unitPrice: z.number().positive('Unit price must be positive'),
  }),
});

export const updateBatchSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
    unitPrice: z.number().positive('Unit price must be positive').optional(),
    status: z.enum(['AVAILABLE', 'RESERVED', 'DEPLETED']).optional(),
  }),
});
