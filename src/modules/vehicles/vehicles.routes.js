import { Router } from 'express';
import * as controller from './vehicles.controller.js';
import { createSchema, updateSchema } from './vehicles.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /vehicles:
 *   post:
 *     summary: Create vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, validate(createSchema), controller.create);

/**
 * @openapi
 * /vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
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
 * /vehicles/{id}:
 *   put:
 *     summary: Update vehicle by ID
 *     tags: [Vehicles]
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
 * /vehicles/{id}:
 *   delete:
 *     summary: Delete vehicle
 *     tags: [Vehicles]
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
