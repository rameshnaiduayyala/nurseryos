import { z } from 'zod';

export const createReservationSchema = z.object({
  body: z.object({
    plantId: z.string().uuid('Invalid Plant ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
    expiresAt: z.string().datetime('Invalid expiration timestamp'),
  }),
});

export const updateReservationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'CANCELLED']),
  }),
});
