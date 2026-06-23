import { Router } from 'express';
import * as authController from './auth.controller.js';
import { registerSchema, loginSchema, refreshSchema } from './auth.validator.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, fullName, roleName]
 *             properties:
 *               email:
 *                 type: string
 *                 example: farmer@nurseryos.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               fullName:
 *                 type: string
 *                 example: John Farmer
 *               roleName:
 *                 type: string
 *                 enum: [ADMIN, FARMER, EXPORTER, SUPERVISOR]
 *                 example: FARMER
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation or parameter issues
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: farmer@nurseryos.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh tokens using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refreshed successfully
 *       401:
 *         description: Refresh token invalid or expired
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out & revoke token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', validate(refreshSchema), authController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Retrieve active user details
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account details retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.getMe);

export default router;
