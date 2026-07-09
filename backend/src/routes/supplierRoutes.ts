import express from 'express';
import { getNearbySuppliers } from '../controllers/supplierController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, restrictTo('BUYER'), getNearbySuppliers);

export default router;
