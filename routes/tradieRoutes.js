import express from 'express';
import { updateCompanyDetails } from '../controllers/tradieController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/company-details').put(protect, updateCompanyDetails);

export default router;