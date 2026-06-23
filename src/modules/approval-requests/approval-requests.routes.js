import { Router } from 'express';
import * as controller from './approval-requests.controller.js';
import {
  createApprovalRequestSchema,
  reviewApprovalRequestSchema,
  getApprovalRequestsQuerySchema,
} from './approval-requests.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createApprovalRequestSchema),
  controller.createApprovalRequest
);

router.get(
  '/',
  authenticate,
  validate(getApprovalRequestsQuerySchema),
  controller.getApprovalRequests
);

router.get('/:id', authenticate, controller.getApprovalRequestById);

router.patch(
  '/:id/review',
  authenticate,
  authorize('ADMIN', 'FARMER'),
  validate(reviewApprovalRequestSchema),
  controller.reviewApprovalRequest
);

export default router;
