import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { redis } from '../config/redis.js';

// @desc    Create a new product (Supplier only)
// @route   POST /api/v1/products
// @access  Private/Supplier
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, unit, stockQty, category, grade, images } = req.body;

    const product = await Product.create({
      supplier: req.user?._id,
      category,
      name,
      description,
      price,
      unit,
      stockQty,
      grade,
      images: images || [], // Image URLs will come from frontend (Cloudinary)
    });

    // Invalidate products cache
    try {
      await redis.del('products:all');
    } catch (redisErr) {
      console.error('Redis cache invalidation error:', redisErr);
    }

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in supplier's inventory
// @route   GET /api/v1/products/inventory
// @access  Private/Supplier
export const getMyInventory = async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ supplier: req.user?._id }).populate('category', 'name');
    res.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product availability
// @route   PATCH /api/v1/products/:id/availability
// @access  Private/Supplier
export const toggleProductAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, supplier: req.user?._id });

    if (!product) {
      res.status(404);
      throw new Error('Product not found or unauthorized');
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    // Invalidate products cache
    try {
      await redis.del('products:all');
    } catch (redisErr) {
      console.error('Redis cache invalidation error:', redisErr);
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all available products (For Buyers to search/filter)
// @route   GET /api/v1/products
// @access  Private/Buyer
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const keywordParam = req.query.keyword as string;
    
    // Create cache key based on keyword
    const cacheKey = keywordParam ? `products:search:${keywordParam.toLowerCase()}` : 'products:all';
    
    try {
      // 1. Check if data is in Redis
      const cachedProducts = await redis.get(cacheKey);
      if (cachedProducts) {
        res.json({ success: true, source: 'cache', count: JSON.parse(cachedProducts).length, data: JSON.parse(cachedProducts) });
        return;
      }
    } catch (redisErr) {
      console.error('Redis GET error:', redisErr);
    }

    // 2. Not in cache, hit MongoDB
    const keywordQuery = keywordParam
      ? {
          name: {
            $regex: keywordParam,
            $options: 'i',
          },
        }
      : {};

    const products = await Product.find({ ...keywordQuery, isAvailable: true })
      .populate('supplier', 'firstName lastName businessInfo')
      .populate('category', 'name');

    try {
      // 3. Store in Redis for 5 minutes (300 seconds)
      await redis.setex(cacheKey, 300, JSON.stringify(products));
    } catch (redisErr) {
      console.error('Redis SETEX error:', redisErr);
    }

    res.json({ success: true, source: 'database', count: products.length, data: products });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
// @access  Private
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'firstName lastName businessInfo profileImage')
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

import { Review } from '../models/Review.js';

// @desc    Get reviews for a product
// @route   GET /api/v1/products/:id/reviews
// @access  Private
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Add review for a product
// @route   POST /api/v1/products/:id/reviews
// @access  Private/Buyer
export const addProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: req.user?._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user?._id,
      rating: Number(rating),
      comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
