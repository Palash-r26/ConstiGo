import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);
export default router;
