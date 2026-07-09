import express from 'express';
import { createProduct, getMyInventory, toggleProductAvailability, getProducts } from '../controllers/productController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, restrictTo('SUPPLIER'), createProduct)
  .get(protect, getProducts); // Buyers and Suppliers can search products

router.get('/inventory', protect, restrictTo('SUPPLIER'), getMyInventory);
router.patch('/:id/availability', protect, restrictTo('SUPPLIER'), toggleProductAvailability);

export default router;
