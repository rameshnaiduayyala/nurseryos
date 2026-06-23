import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    userId: z.string().uuid().optional(),
  })
});
