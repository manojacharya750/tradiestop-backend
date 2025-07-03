import express from 'express';
import { createBooking, updateBookingStatus, rescheduleBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBooking);
router.route('/:id/status').put(protect, updateBookingStatus);
router.route('/:id/reschedule').put(protect, rescheduleBooking);

export default router;