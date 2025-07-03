import express from 'express';
import { addReview, addClientReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addReview);
router.route('/client').post(protect, addClientReview);

export default router;