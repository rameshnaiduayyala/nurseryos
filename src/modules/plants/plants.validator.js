import { z } from 'zod';

export const createPlantSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Plant name is required'),
    categoryId: z.string().uuid('Invalid Category ID'),
    varietyId: z.string().uuid('Invalid Variety ID'),
    bagSizeId: z.string().uuid('Invalid Bag Size ID'),
    description: z.string().optional(),
    unitPrice: z.number().positive('Unit price must be positive'),
  }),
});

export const updatePlantSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    categoryId: z.string().uuid('Invalid Category ID').optional(),
    varietyId: z.string().uuid('Invalid Variety ID').optional(),
    bagSizeId: z.string().uuid('Invalid Bag Size ID').optional(),
    description: z.string().optional(),
    unitPrice: z.number().positive('Unit price must be positive').optional(),
  }),
});

export const searchPlantsSchema = z.object({
  query: z.object({
    name: z.string().optional(),
    categoryId: z.string().uuid('Invalid Category ID').optional(),
    varietyId: z.string().uuid('Invalid Variety ID').optional(),
    bagSizeId: z.string().uuid('Invalid Bag Size ID').optional(),
    nurseryId: z.string().uuid('Invalid Nursery ID').optional(),
    minAvailability: z.coerce.number().int().nonnegative().optional(),
    location: z.string().optional(),
    radiusKm: z.coerce.number().positive().optional(),
  }),
});
