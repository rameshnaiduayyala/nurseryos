import { Router } from 'express';
import * as controller from './dashboard.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /dashboard:
 *   get:
 *     summary: Retrieve dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticate, controller.getSummary);

export default router;
