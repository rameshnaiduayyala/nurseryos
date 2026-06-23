import { z } from 'zod';

export const createPosSaleSchema = z.object({
  body: z.object({
    nurseryId: z.string().uuid('Invalid Nursery ID'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT']),
    paymentStatus: z.enum(['PAID', 'UNPAID']),
    items: z.array(
      z.object({
        plantId: z.string().uuid('Invalid Plant ID'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        unitPrice: z.number().positive('Unit price must be positive'),
      })
    ).min(1, 'POS sale must contain at least one item'),
  }),
});
