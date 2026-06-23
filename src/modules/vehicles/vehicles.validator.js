import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    licensePlate: z.string().min(1),
    model: z.string().min(1),
    capacity: z.number().int().positive(),
    status: z.enum(['AVAILABLE', 'MAINTENANCE', 'ACTIVE']).optional(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    licensePlate: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    capacity: z.number().int().positive().optional(),
    status: z.enum(['AVAILABLE', 'MAINTENANCE', 'ACTIVE']).optional(),
  })
});
