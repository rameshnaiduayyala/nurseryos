import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid Vehicle ID'),
    driverId: z.string().uuid('Invalid Driver ID'),
    supervisorId: z.string().uuid('Invalid Supervisor ID'),
    departureDate: z.string().datetime('Invalid departure date-time'),
    stops: z.array(
      z.object({
        nurseryId: z.string().uuid('Invalid Nursery ID'),
        stopOrder: z.number().int().min(1, 'Stop order must be at least 1'),
      })
    ).min(1, 'Trip must have at least one stop'),
  }),
});

export const updateTripStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PLANNED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']),
  }),
});
