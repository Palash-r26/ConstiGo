import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/razorpay/create', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;
