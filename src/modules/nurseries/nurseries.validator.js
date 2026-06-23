import { z } from 'zod';

export const createNurserySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nursery name is required'),
    location: z.string().min(1, 'Location is required'),
  }),
});

export const updateNurserySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const approveNurserySchema = z.object({
  body: z.object({
    isApproved: z.boolean(),
  }),
});
