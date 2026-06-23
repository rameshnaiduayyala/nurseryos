import { Router } from 'express';
import * as inventoryController from './inventory.controller.js';
import { createBatchSchema, updateBatchSchema } from './inventory.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /inventory:
 *   post:
 *     summary: Add stock as a new inventory batch (Farmer only)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nurseryBlockId, plantId, quantity, unitPrice]
 *             properties:
 *               nurseryBlockId:
 *                 type: string
 *                 example: block-uuid-here
 *               plantId:
 *                 type: string
 *                 example: plant-uuid-here
 *               quantity:
 *                 type: integer
 *                 example: 500
 *               unitPrice:
 *                 type: number
 *                 example: 18.00
 *     responses:
 *       201:
 *         description: Stock batch added
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  authorize('FARMER'),
  validate(createBatchSchema),
  inventoryController.createBatch
);

/**
 * @openapi
 * /inventory/{id}:
 *   put:
 *     summary: Adjust inventory batch quantity, status or price (Farmer only)
 *     tags: [Inventory]
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
 *             properties:
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, RESERVED, DEPLETED]
 *     responses:
 *       200:
 *         description: Batch updated and change logged
 */
router.put(
  '/:id',
  authenticate,
  authorize('FARMER'),
  validate(updateBatchSchema),
  inventoryController.updateBatch
);

/**
 * @openapi
 * /inventory:
 *   get:
 *     summary: Get inventory list (filtered by ownership for Farmers)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of inventory batches
 */
router.get('/', authenticate, inventoryController.getInventory);

/**
 * @openapi
 * /inventory/{id}/transactions:
 *   get:
 *     summary: Retrieve history of transactions for an inventory batch (Farmer & Admin)
 *     tags: [Inventory]
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
 *         description: Batch transaction logs list
 */
router.get('/:id/transactions', authenticate, authorize('ADMIN', 'FARMER'), inventoryController.getBatchTransactions);

export default router;
