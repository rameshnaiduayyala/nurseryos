import { Router } from 'express';
import * as collectionsController from './collections.controller.js';
import { collectPlantsSchema, updateStopStatusSchema } from './collections.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /collections:
 *   post:
 *     summary: Log a collection of plants during a stop (Supervisor only)
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [tripStopId, plantId, quantityCollected]
 *             properties:
 *               tripStopId:
 *                 type: string
 *                 example: stop-uuid-here
 *               plantId:
 *                 type: string
 *                 example: plant-uuid-here
 *               quantityCollected:
 *                 type: integer
 *                 example: 50
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Collection recorded, photo uploaded, and inventory batch reduced
 *       400:
 *         description: Validation error or pre-requisite stop state not met
 */
router.post(
  '/',
  authenticate,
  authorize('SUPERVISOR'),
  collectionsController.uploadPhoto,
  validate(collectPlantsSchema),
  collectionsController.collectPlants
);

/**
 * @openapi
 * /collections/stops/{id}:
 *   patch:
 *     summary: Change trip stop status to Arrived/Departed (Supervisor only)
 *     tags: [Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ARRIVED, DEPARTED]
 *                 example: ARRIVED
 *     responses:
 *       200:
 *         description: Stop status updated
 */
router.patch(
  '/stops/:id',
  authenticate,
  authorize('SUPERVISOR'),
  validate(updateStopStatusSchema),
  collectionsController.updateStopStatus
);

export default router;
