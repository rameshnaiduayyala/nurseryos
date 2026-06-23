import { Router } from 'express';
import * as tripsController from './trips.controller.js';
import { createTripSchema, updateTripStatusSchema } from './trips.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /trips:
 *   post:
 *     summary: Plan a new trip and allocate resources (Exporter only)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, driverId, supervisorId, departureDate, stops]
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 example: vehicle-uuid-here
 *               driverId:
 *                 type: string
 *                 example: driver-uuid-here
 *               supervisorId:
 *                 type: string
 *                 example: supervisor-uuid-here
 *               departureDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-30T08:00:00.000Z"
 *               stops:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [nurseryId, stopOrder]
 *                   properties:
 *                     nurseryId:
 *                       type: string
 *                       example: nursery-uuid-here
 *                     stopOrder:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Trip planned successfully
 */
router.post(
  '/',
  authenticate,
  authorize('EXPORTER'),
  validate(createTripSchema),
  tripsController.createTrip
);

/**
 * @openapi
 * /trips:
 *   get:
 *     summary: Retrieve trips list (Filtered based on user permissions)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 */
router.get('/', authenticate, tripsController.getTrips);

/**
 * @openapi
 * /trips/{id}:
 *   get:
 *     summary: Get details of a specific trip
 *     tags: [Trips]
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
 *         description: Trip details with stops and collections
 */
router.get('/:id', authenticate, tripsController.getTripById);

/**
 * @openapi
 * /trips/{id}/status:
 *   patch:
 *     summary: Update trip status (Planned -> In Transit -> Completed)
 *     tags: [Trips]
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
 *                 enum: [PLANNED, IN_TRANSIT, COMPLETED, CANCELLED]
 *                 example: IN_TRANSIT
 *     responses:
 *       200:
 *         description: Trip status updated
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'EXPORTER', 'SUPERVISOR'),
  validate(updateTripStatusSchema),
  tripsController.updateTripStatus
);

export default router;
