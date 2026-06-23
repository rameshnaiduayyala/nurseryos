import { Router } from 'express';
import * as controller from './reports.controller.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: Retrieve reports data
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticate, controller.getSummary);
router.get('/farmer-ledger', authenticate, controller.getFarmerLedger);
router.get('/customer-ledger', authenticate, controller.getCustomerLedger);

export default router;
