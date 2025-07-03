import express from 'express';
import { getAllData, getNotifications, markNotificationsRead } from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/all').get(protect, getAllData);
router.route('/notifications').get(protect, getNotifications);
router.route('/notifications/read').put(protect, markNotificationsRead);

export default router;
