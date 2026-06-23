import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    invoiceId: z.string().uuid(),
    amount: z.number().positive(),
    paymentMethod: z.string().min(1),
    transactionReference: z.string().optional(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    transactionReference: z.string().optional(),
  })
});
