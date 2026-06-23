import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    licenseNumber: z.string().min(1),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'INACTIVE']).optional(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    licenseNumber: z.string().min(1).optional(),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'INACTIVE']).optional(),
  })
});
