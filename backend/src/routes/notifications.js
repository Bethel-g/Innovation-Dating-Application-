import express from 'express';
import {
  getNotifications, markAsRead, markAllAsRead,
  deleteNotification, getUnreadCount,
  getNotificationPreferences, updateNotificationPreferences,
} from '../controllers/notificationController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', updateNotificationPreferences);
router.delete('/:id', deleteNotification);

export default router;
