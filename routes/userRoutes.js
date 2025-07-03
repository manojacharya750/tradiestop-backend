import express from 'express';
import { updateUserProfile, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile').put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);

export default router;