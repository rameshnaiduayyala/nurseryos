import { Router } from 'express';
import * as controller from './nursery-blocks.controller.js';
import { createSchema, updateSchema } from './nursery-blocks.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /nursery-blocks:
 *   post:
 *     summary: Create nurseryBlock
 *     tags: [Nursery-blocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, authorize('ADMIN', 'FARMER'), validate(createSchema), controller.create);

/**
 * @openapi
 * /nursery-blocks:
 *   get:
 *     summary: Get all nursery-blocks
 *     tags: [Nursery-blocks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /nursery-blocks/{id}:
 *   get:
 *     summary: Get nurseryBlock by ID
 *     tags: [Nursery-blocks]
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
 * /nursery-blocks/{id}:
 *   put:
 *     summary: Update nurseryBlock by ID
 *     tags: [Nursery-blocks]
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
router.put('/:id', authenticate, authorize('ADMIN', 'FARMER'), validate(updateSchema), controller.update);

/**
 * @openapi
 * /nursery-blocks/{id}:
 *   delete:
 *     summary: Delete nurseryBlock
 *     tags: [Nursery-blocks]
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
router.delete('/:id', authenticate, authorize('ADMIN', 'FARMER'), controller.remove);

export default router;
