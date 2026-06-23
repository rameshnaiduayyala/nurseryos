import { Router } from 'express';
import * as controller from './payments.controller.js';
import { createSchema, updateSchema } from './payments.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Create payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, validate(createSchema), controller.create);

/**
 * @openapi
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Details
 */
router.get('/:id', authenticate, controller.getById);

/**
 * @openapi
 * /payments/{id}:
 *   put:
 *     summary: Update payment by ID
 *     tags: [Payments]
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
 *         description: Updated
 */
router.put('/:id', authenticate, validate(updateSchema), controller.update);

/**
 * @openapi
 * /payments/{id}:
 *   delete:
 *     summary: Delete payment
 *     tags: [Payments]
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
 *         description: Deleted
 */
router.delete('/:id', authenticate, controller.remove);

export default router;
