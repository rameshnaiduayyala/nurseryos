import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  })
});
export const updateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
  })
});
