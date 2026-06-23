import { z } from 'zod';

const optionalCoordinate = (min, max) =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.coerce.number().min(min).max(max).optional()
  );

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
    nurseryAddress: z.string().optional(),
    nurseryGst: z.string().optional(),
    nurseryContactPerson: z.string().optional(),
    nurseryMobileNumber: z.string().optional(),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
  }).refine((data) => {
    if (data.roleName === 'FARMER') {
      return !!data.nurseryName && data.nurseryName.trim().length > 0;
    }
    return true;
  }, {
    message: 'Nursery name is required for farmer registration',
    path: ['nurseryName'],
  }).refine((data) => {
    if (data.roleName === 'FARMER') {
      return !!data.nurseryLocation && data.nurseryLocation.trim().length > 0;
    }
    return true;
  }, {
    message: 'Nursery location is required for farmer registration',
    path: ['nurseryLocation'],
  }).refine((data) => {
    if (data.roleName === 'FARMER') {
      return !!data.nurseryMobileNumber && data.nurseryMobileNumber.trim().length > 0;
    }
    return true;
  }, {
    message: 'Nursery mobile number is required for farmer registration',
    path: ['nurseryMobileNumber'],
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
