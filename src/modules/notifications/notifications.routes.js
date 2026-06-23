import { Router } from 'express';
import * as controller from './notifications.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { getNotificationsQuerySchema } from './notifications.validator.js';

const router = Router();

router.get('/', authenticate, validate(getNotificationsQuerySchema), controller.getMyNotifications);

router.get('/unread-count', authenticate, controller.getUnreadCount);

router.patch('/:id/read', authenticate, controller.markAsRead);

router.patch('/read-all', authenticate, controller.markAllAsRead);

router.delete('/:id', authenticate, controller.deleteNotification);

export default router;
