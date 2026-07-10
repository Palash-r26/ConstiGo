import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { razorpay } from '../config/razorpay.js';
import crypto from 'crypto';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ buyer: req.user?.id }).populate('orderItems.product').sort('-createdAt');
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createRazorpayOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { supplier, orderItems, shippingAddress, totalPrice } = req.body;
    const buyerId = req.user?._id;

    if (!buyerId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const order = new Order({
      buyer: buyerId,
      supplier,
      orderItems,
      shippingAddress,
      totalPrice,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      status: 'PENDING',
    });

    const createdOrder = await order.save();

    const options = {
      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: 'INR',
      receipt: createdOrder._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    createdOrder.razorpayOrderId = razorpayOrder.id;
    await createdOrder.save();

    res.status(201).json({
      order: createdOrder,
      razorpayOrder,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      order.paymentStatus = 'COMPLETED';
      order.status = 'ACCEPTED';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;

      await order.save();

      res.status(200).json({
        message: 'Payment verified successfully',
        order,
      });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};
