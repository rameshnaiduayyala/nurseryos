import { Router } from 'express';
import * as nurseriesController from './nurseries.controller.js';
import { createNurserySchema, updateNurserySchema, approveNurserySchema } from './nurseries.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /nurseries:
 *   post:
 *     summary: Register a new nursery (Farmer only)
 *     tags: [Nurseries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Green Valley Nursery
 *               location:
 *                 type: string
 *                 example: California, USA
 *               address:
 *                 type: string
 *               gst:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Registered successfully (Pending approval)
 *       403:
 *         description: Forbidden (Only farmers can register)
 */
router.post(
  '/',
  authenticate,
  authorize('FARMER'),
  validate(createNurserySchema),
  nurseriesController.createNursery
);

/**
 * @openapi
 * /nurseries:
 *   get:
 *     summary: Retrieve list of nurseries based on user role
 *     tags: [Nurseries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of nurseries
 */
router.get('/', authenticate, nurseriesController.getNurseries);

/**
 * @openapi
 * /nurseries/nearby:
 *   get:
 *     summary: Search for approved nurseries near a coordinate (Exporter & Admin only)
 *     tags: [Nurseries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: latitude
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: longitude
 *         in: query
 *         required: true
 *         schema:
 *           type: number
 *       - name: radius
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *           default: 50
 *     responses:
 *       200:
 *         description: Array of nurseries within the radius sorted by proximity
 */
router.get('/nearby', authenticate, authorize('ADMIN', 'EXPORTER'), nurseriesController.getNearbyNurseries);

/**
 * @openapi
 * /nurseries/{id}:
 *   get:
 *     summary: Retrieve specific nursery by ID
 *     tags: [Nurseries]
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
 *         description: Nursery details retrieved
 *       404:
 *         description: Nursery not found
 */
router.get('/:id', authenticate, nurseriesController.getNurseryById);

/**
 * @openapi
 * /nurseries/{id}:
 *   put:
 *     summary: Update nursery details
 *     tags: [Nurseries]
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
 *               location:
 *                 type: string
 *               address:
 *                 type: string
 *               gst:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Nursery updated successfully
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FARMER'),
  validate(updateNurserySchema),
  nurseriesController.updateNursery
);

/**
 * @openapi
 * /nurseries/{id}/approve:
 *   patch:
 *     summary: Approve or reject nursery registration (Admin only)
 *     tags: [Nurseries]
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
 *             required: [isApproved]
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Nursery approval status updated
 *       403:
 *         description: Forbidden (Admin only)
 */
router.patch(
  '/:id/approve',
  authenticate,
  authorize('ADMIN'),
  validate(approveNurserySchema),
  nurseriesController.approveNursery
);

/**
 * @openapi
 * /nurseries/{id}:
 *   delete:
 *     summary: Delete a nursery
 *     tags: [Nurseries]
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
 *         description: Nursery deleted successfully
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'FARMER'), nurseriesController.deleteNursery);

export default router;
