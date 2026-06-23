import { Router } from 'express';
import * as controller from './users.controller.js';
import { createSchema, updateSchema } from './users.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, authorize('ADMIN'), validate(createSchema), controller.create);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, authorize('ADMIN', 'EXPORTER'), controller.getAll);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
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
router.get('/:id', authenticate, authorize('ADMIN'), controller.getById);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
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
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateSchema), controller.update);

/**
 * @openapi
 * /users/{id}/approve:
 *   patch:
 *     summary: Approve user registration (Admin only)
 *     tags: [Users]
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
 *         description: User approved and activated successfully
 *       403:
 *         description: Forbidden
 */
router.patch('/:id/approve', authenticate, authorize('ADMIN'), controller.approve);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
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
