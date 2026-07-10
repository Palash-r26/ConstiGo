import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .post(protect, addToCart)
  .patch(protect, updateCartItem)
  .delete(protect, clearCart);

router.delete('/:productId', protect, removeCartItem);

export default router;
