import { Router } from 'express';
import * as reservationsController from './reservations.controller.js';
import { createReservationSchema, updateReservationStatusSchema } from './reservations.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /reservations:
 *   post:
 *     summary: Reserve a plant stock (Exporter only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plantId, quantity, expiresAt]
 *             properties:
 *               plantId:
 *                 type: string
 *                 example: plant-uuid-here
 *               quantity:
 *                 type: integer
 *                 example: 100
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-30T12:00:00.000Z"
 *     responses:
 *       201:
 *         description: Stock reserved (Pending)
 *       400:
 *         description: Insufficient stock or invalid payload
 */
router.post(
  '/',
  authenticate,
  authorize('EXPORTER'),
  validate(createReservationSchema),
  reservationsController.createReservation
);

/**
 * @openapi
 * /reservations:
 *   get:
 *     summary: Retrieve reservations lists (Filtered by role permissions)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reservations
 */
router.get('/', authenticate, reservationsController.getReservations);

/**
 * @openapi
 * /reservations/{id}:
 *   get:
 *     summary: Get reservation details
 *     tags: [Reservations]
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
 *         description: Reservation details
 */
router.get('/:id', authenticate, reservationsController.getReservationById);

/**
 * @openapi
 * /reservations/{id}/status:
 *   patch:
 *     summary: Approve (Farmer only) or Cancel (Exporter/Farmer) reservation
 *     tags: [Reservations]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, CANCELLED]
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Reservation status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'FARMER', 'EXPORTER'),
  validate(updateReservationStatusSchema),
  reservationsController.updateReservationStatus
);

export default router;
