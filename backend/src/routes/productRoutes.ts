import express from 'express';
import { createProduct, getMyInventory, toggleProductAvailability, getProducts, getProductById, getProductReviews, addProductReview } from '../controllers/productController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, restrictTo('SUPPLIER'), createProduct)
  .get(protect, getProducts); // Buyers and Suppliers can search products

router.get('/inventory', protect, restrictTo('SUPPLIER'), getMyInventory);
router.patch('/:id/availability', protect, restrictTo('SUPPLIER'), toggleProductAvailability);

router.get('/:id', protect, getProductById);
router.route('/:id/reviews')
  .get(protect, getProductReviews)
  .post(protect, restrictTo('BUYER'), addProductReview);

export default router;
