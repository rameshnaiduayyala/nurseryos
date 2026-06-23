import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    procurementOrderId: z.string().uuid(),
    invoiceNumber: z.string().min(1),
    amountDue: z.number().positive(),
    dueDate: z.string().datetime(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    amountPaid: z.number().nonnegative().optional(),
    status: z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID', 'VOID']).optional(),
    dueDate: z.string().datetime().optional(),
  })
});
