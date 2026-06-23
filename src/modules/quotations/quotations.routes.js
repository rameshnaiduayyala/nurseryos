import { Router } from 'express';
import * as controller from './quotations.controller.js';
import { createSchema, updateSchema } from './quotations.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /quotations:
 *   post:
 *     summary: Create quotation
 *     tags: [Quotations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authenticate, validate(createSchema), controller.create);

/**
 * @openapi
 * /quotations:
 *   get:
 *     summary: Get all quotations
 *     tags: [Quotations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/', authenticate, controller.getAll);

/**
 * @openapi
 * /quotations/{id}/pdf:
 *   get:
 *     summary: Download quotation in PDF format
 *     tags: [Quotations]
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
 *         description: PDF file binary stream
 */
router.get('/:id/pdf', authenticate, controller.downloadPdf);

/**
 * @openapi
 * /quotations/{id}:
 *   get:
 *     summary: Get quotation by ID
 *     tags: [Quotations]
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
 * /quotations/{id}:
 *   put:
 *     summary: Update quotation by ID
 *     tags: [Quotations]
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
 * /quotations/{id}:
 *   delete:
 *     summary: Delete quotation
 *     tags: [Quotations]
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
