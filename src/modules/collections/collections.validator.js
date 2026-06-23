import { z } from 'zod';

export const collectPlantsSchema = z.object({
  body: z.object({
    tripStopId: z.string().uuid('Invalid Trip Stop ID'),
    plantId: z.string().uuid('Invalid Plant ID'),
    quantityCollected: z.coerce.number().int().positive('Quantity collected must be positive'),
  }),
});

export const updateStopStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ARRIVED', 'DEPARTED']),
  }),
});
