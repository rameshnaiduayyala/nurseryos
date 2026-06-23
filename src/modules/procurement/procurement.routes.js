import { Router } from 'express';
import * as procurementController from './procurement.controller.js';
import { createOrderSchema, updateOrderStatusSchema } from './procurement.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /procurement:
 *   post:
 *     summary: Place a new procurement order & auto-generate invoice (Exporter only)
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: customer-uuid-here
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [plantId, quantity, unitPrice]
 *                   properties:
 *                     plantId:
 *                       type: string
 *                       example: plant-uuid-here
 *                     quantity:
 *                       type: integer
 *                       example: 250
 *                     unitPrice:
 *                       type: number
 *                       example: 22.00
 *     responses:
 *       201:
 *         description: Order created and invoice generated
 */
router.post(
  '/',
  authenticate,
  authorize('EXPORTER'),
  validate(createOrderSchema),
  procurementController.createOrder
);

/**
 * @openapi
 * /procurement:
 *   get:
 *     summary: Retrieve procurement orders (Filtered by role permissions)
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of procurement orders
 */
router.get('/', authenticate, procurementController.getOrders);

/**
 * @openapi
 * /procurement/{id}:
 *   get:
 *     summary: Get details of a specific procurement order
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', authenticate, procurementController.getOrderById);

/**
 * @openapi
 * /procurement/{id}/status:
 *   patch:
 *     summary: Update procurement order status
 *     tags: [Procurement]
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
 *                 enum: [DRAFT, SUBMITTED, APPROVED, PROCESSING, SHIPPED, COMPLETED, CANCELLED]
 *                 example: COMPLETED
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'EXPORTER'),
  validate(updateOrderStatusSchema),
  procurementController.updateOrderStatus
);

export default router;
