import { Router } from 'express';
import * as plantsController from './plants.controller.js';
import { createPlantSchema, updatePlantSchema, searchPlantsSchema } from './plants.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate, authorize } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /plants:
 *   post:
 *     summary: Create a new plant catalog entry (Admin only)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, categoryId, varietyId, bagSizeId, unitPrice]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ficus Lyrata
 *               categoryId:
 *                 type: string
 *                 example: category-uuid-here
 *               varietyId:
 *                 type: string
 *                 example: variety-uuid-here
 *               bagSizeId:
 *                 type: string
 *                 example: bag-size-uuid-here
 *               description:
 *                 type: string
 *                 example: Also known as the fiddle-leaf fig.
 *               unitPrice:
 *                 type: number
 *                 example: 25.50
 *     responses:
 *       201:
 *         description: Plant created successfully
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'FARMER'),
  validate(createPlantSchema),
  plantsController.createPlant
);

/**
 * @openapi
 * /plants:
 *   get:
 *     summary: Get all plants or search with filters
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: categoryId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: varietyId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: bagSizeId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of plants matching filters
 */
router.get('/', authenticate, validate(searchPlantsSchema), plantsController.getPlants);

/**
 * @openapi
 * /plants/suggestions:
 *   get:
 *     summary: Get plant name suggestions for autocomplete (all authenticated users)
 *     tags: [Plants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Array of matching plant suggestions with name and farmer info
 */
router.get('/suggestions', authenticate, plantsController.getSuggestions);

/**
 * @openapi
 * /plants/{id}:
 *   get:
 *     summary: Get plant details by ID
 *     tags: [Plants]
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
 *         description: Plant details
 *       404:
 *         description: Plant not found
 */
router.get('/:id', authenticate, plantsController.getPlantById);

/**
 * @openapi
 * /plants/{id}:
 *   put:
 *     summary: Update plant details (Admin only)
 *     tags: [Plants]
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
 *               categoryId:
 *                 type: string
 *               varietyId:
 *                 type: string
 *               bagSizeId:
 *                 type: string
 *               description:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Plant updated
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updatePlantSchema),
  plantsController.updatePlant
);

/**
 * @openapi
 * /plants/{id}:
 *   delete:
 *     summary: Delete a plant (Admin only)
 *     tags: [Plants]
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
 *         description: Plant deleted
 */
router.delete('/:id', authenticate, plantsController.deletePlant);

export default router;
