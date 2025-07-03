import express from 'express';
import { createSupportTicket, updateTicketStatus } from '../controllers/supportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createSupportTicket);
router.route('/:id/status').put(protect, admin, updateTicketStatus);

export default router;