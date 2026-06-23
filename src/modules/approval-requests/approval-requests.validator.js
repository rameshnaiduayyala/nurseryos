import { z } from 'zod';

export const createApprovalRequestSchema = z.object({
  body: z.object({
    entityType: z.enum(['RESERVATION', 'PROCUREMENT_ORDER', 'COLLECTION', 'NURSERY', 'PLAN']),
    entityId: z.string().uuid('Invalid entity ID'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    note: z.string().optional(),
  }),
});

export const reviewApprovalRequestSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'UNDER_REVIEW']),
    reviewNote: z.string().optional(),
  }),
});

export const getApprovalRequestsQuerySchema = z.object({
  query: z.object({
    entityType: z.enum(['RESERVATION', 'PROCUREMENT_ORDER', 'COLLECTION', 'NURSERY', 'PLAN']).optional(),
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']).optional(),
  }),
});
