import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getMyProfile,
  updateProfile,
  toggleWishlist,
  getFavourites,
  addAddress,
  deleteAddress,
} from '../controllers/userController.js';

const router = express.Router();

// Profile
router.get('/me', protect, getMyProfile);
router.patch('/me', protect, updateProfile);

// Favourites
router.get('/me/favourites', protect, getFavourites);
router.post('/me/wishlist/:productId', protect, toggleWishlist);

// Addresses
router.post('/me/address', protect, addAddress);
router.delete('/me/address/:addressId', protect, deleteAddress);

export default router;
