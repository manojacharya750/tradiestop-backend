import express from 'express';
import { createInvoice, markInvoiceAsPaid } from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createInvoice);
router.route('/:id/pay').put(protect, markInvoiceAsPaid);

export default router;