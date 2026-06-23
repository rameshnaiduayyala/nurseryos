import { Router } from 'express';
import * as controller from './supervisors.controller.js';
import { createSchema, updateSchema } from './supervisors.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /supervisors:
 *   post:
 *     summary: Create supervisor
 *     tags: [Supervisors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, validate(createSchema), controller.create);

/**
 * @openapi
 * /supervisors:
 *   get:
 *     summary: Get all supervisors
 *     tags: [Supervisors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /supervisors/{id}:
 *   get:
 *     summary: Get supervisor by ID
 *     tags: [Supervisors]
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
 * /supervisors/{id}:
 *   put:
 *     summary: Update supervisor by ID
 *     tags: [Supervisors]
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
 * /supervisors/{id}:
 *   delete:
 *     summary: Delete supervisor
 *     tags: [Supervisors]
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
