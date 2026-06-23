import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  })
});
