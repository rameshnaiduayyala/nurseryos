import { Router } from 'express';
import * as controller from './bag-sizes.controller.js';
import { createSchema, updateSchema } from './bag-sizes.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /bag-sizes:
 *   post:
 *     summary: Create bagSize
 *     tags: [Bag-sizes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, validate(createSchema), controller.create);

/**
 * @openapi
 * /bag-sizes:
 *   get:
 *     summary: Get all bag-sizes
 *     tags: [Bag-sizes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /bag-sizes/{id}:
 *   get:
 *     summary: Get bagSize by ID
 *     tags: [Bag-sizes]
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
 * /bag-sizes/{id}:
 *   put:
 *     summary: Update bagSize by ID
 *     tags: [Bag-sizes]
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
 * /bag-sizes/{id}:
 *   delete:
 *     summary: Delete bagSize
 *     tags: [Bag-sizes]
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
