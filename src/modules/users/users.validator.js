import { z } from 'zod';
export const createSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    roleId: z.string().uuid(),
  })
});
export const updateSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    fullName: z.string().min(1).optional(),
    roleId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
  })
});
