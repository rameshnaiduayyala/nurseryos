import { z } from 'zod';

export const createHeightSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
  }),
});

export const updateHeightSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  }),
});
