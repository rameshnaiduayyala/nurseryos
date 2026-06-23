import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    totalAmount: z.number().positive(),
    expiresAt: z.string().datetime(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    totalAmount: z.number().positive().optional(),
    status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']).optional(),
    expiresAt: z.string().datetime().optional(),
  })
});
