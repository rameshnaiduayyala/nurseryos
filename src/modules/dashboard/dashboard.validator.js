import { z } from 'zod';
export const querySchema = z.object({
  query: z.object({}).optional()
});
