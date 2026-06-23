import { z } from 'zod';

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    read: z.enum(['true', 'false']).optional(),
  }),
});
