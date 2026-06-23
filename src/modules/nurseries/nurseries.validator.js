import { z } from 'zod';

const optionalCoordinate = (min, max) =>
  z.preprocess(
    (value) => (value === '' || value == null ? undefined : value),
    z.coerce.number().min(min).max(max).optional()
  );

export const createNurserySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nursery name is required'),
    location: z.string().min(1, 'Location is required'),
    address: z.string().optional(),
    gst: z.string().optional(),
    contactPerson: z.string().optional(),
    mobileNumber: z.string().optional(),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
  }),
});

export const updateNurserySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    gst: z.string().optional(),
    contactPerson: z.string().optional(),
    mobileNumber: z.string().optional(),
    latitude: optionalCoordinate(-90, 90),
    longitude: optionalCoordinate(-180, 180),
  }),
});

export const approveNurserySchema = z.object({
  body: z.object({
    isApproved: z.boolean(),
  }),
});
