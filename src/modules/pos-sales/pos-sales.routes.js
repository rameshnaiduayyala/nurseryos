import { Router } from 'express';
import * as controller from './pos-sales.controller.js';
import { createPosSaleSchema } from './pos-sales.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /pos-sales:
 *   post:
 *     summary: Log a POS retail sale & deduct nursery inventory blocks (Farmer only)
 *     tags: [POS Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nurseryId, customerName, paymentMethod, paymentStatus, items]
 *             properties:
 *               nurseryId:
 *                 type: string
 *                 example: nursery-uuid-here
 *               customerName:
 *                 type: string
 *                 example: Walk-in Customer
 *               customerPhone:
 *                 type: string
 *                 example: "+91-9988776655"
 *               paymentMethod:
 *                 type: string
 *                 enum: [CASH, CARD, UPI, CREDIT]
 *                 example: UPI
 *               paymentStatus:
 *                 type: string
 *                 enum: [PAID, UNPAID]
 *                 example: PAID
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
 *                       example: 5
 *                     unitPrice:
 *                       type: number
 *                       example: 450.00
 *     responses:
 *       201:
 *         description: Sale completed successfully
 *       403:
 *         description: Forbidden (Farmer only)
 */
router.post('/', authenticate, authorize('FARMER'), validate(createPosSaleSchema), controller.createPosSale);

/**
 * @openapi
 * /pos-sales:
 *   get:
 *     summary: Retrieve history of POS retail sales (Farmer only)
 *     tags: [POS Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales
 */
router.get('/', authenticate, authorize('FARMER'), controller.getPosSales);

/**
 * @openapi
 * /pos-sales/{id}:
 *   get:
 *     summary: Retrieve details of a specific POS sale
 *     tags: [POS Sales]
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
 *         description: Detailed POS sale records
 */
router.get('/:id', authenticate, authorize('FARMER'), controller.getPosSaleById);

/**
 * @openapi
 * /pos-sales/{id}/print:
 *   get:
 *     summary: Render an 80mm HTML thermal receipt ready to print (Farmer only)
 *     tags: [POS Sales]
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
 *         description: HTML printed output
 */
router.get('/:id/print', authenticate, authorize('FARMER'), controller.printReceipt);

export default router;
