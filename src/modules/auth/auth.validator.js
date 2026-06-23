import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required'),
    roleName: z.enum(['ADMIN', 'FARMER', 'EXPORTER', 'SUPERVISOR'], {
      errorMap: () => ({ message: 'Role must be one of ADMIN, FARMER, EXPORTER, SUPERVISOR' }),
    }),
    nurseryName: z.string().optional(),
    nurseryLocation: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  }).refine((data) => {
    if (data.roleName === 'FARMER') {
      return !!data.nurseryName && data.nurseryName.trim().length > 0;
    }
    return true;
  }, {
    message: 'Nursery name is required for farmer registration',
    path: ['nurseryName'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
