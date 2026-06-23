import { Router } from 'express';
import * as controller from './plans.controller.js';
import {
  createPlanSchema,
  updatePlanStatusSchema,
  updatePlanStopStatusSchema,
} from './plans.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('EXPORTER', 'ADMIN'),
  validate(createPlanSchema),
  controller.createPlan
);

router.get('/', authenticate, controller.getPlans);

router.get('/:id', authenticate, controller.getPlanById);

router.patch(
  '/:id/status',
  authenticate,
  authorize('EXPORTER', 'ADMIN'),
  validate(updatePlanStatusSchema),
  controller.updatePlanStatus
);

router.patch(
  '/:id/stops/:stopId',
  authenticate,
  validate(updatePlanStopStatusSchema),
  controller.updatePlanStopStatus
);

router.get('/:id/availability', authenticate, controller.getPlanAvailability);

export default router;
