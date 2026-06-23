import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Plan name is required'),
    description: z.string().optional(),
    type: z.enum(['DELIVERY', 'COLLECTION', 'MAINTENANCE']).optional(),
    plannedDate: z.string().datetime().optional(),
    notes: z.string().optional(),
    stops: z
      .array(
        z.object({
          nurseryId: z.string().uuid('Invalid nursery ID'),
          plannedQuantity: z.number().int().nonnegative().optional(),
          notes: z.string().optional(),
        })
      )
      .min(1, 'At least one stop is required'),
  }),
});

export const updatePlanStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
  }),
});

export const updatePlanStopStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ARRIVED', 'DEPARTED', 'PENDING', 'SKIPPED']),
  }),
});
