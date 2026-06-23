import { Router } from 'express';
import * as controller from './height-standards.controller.js';
import { createHeightSchema, updateHeightSchema } from './height-standards.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /height-standards:
 *   post:
 *     summary: Create height standard (Admin only)
 *     tags: [HeightStandards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "6 ft"
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, authorize('ADMIN'), validate(createHeightSchema), controller.create);

/**
 * @openapi
 * /height-standards:
 *   get:
 *     summary: Get all height standards
 *     tags: [HeightStandards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of height standards
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /height-standards/{id}:
 *   get:
 *     summary: Get height standard by ID
 *     tags: [HeightStandards]
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
 * /height-standards/{id}:
 *   put:
 *     summary: Update height standard (Admin only)
 *     tags: [HeightStandards]
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
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateHeightSchema), controller.update);

/**
 * @openapi
 * /height-standards/{id}:
 *   delete:
 *     summary: Delete height standard (Admin only)
 *     tags: [HeightStandards]
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
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

export default router;
