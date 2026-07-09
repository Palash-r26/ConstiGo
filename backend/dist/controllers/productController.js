import { Product } from '../models/Product.js';
import { redis } from '../config/redis.js';
// @desc    Create a new product (Supplier only)
// @route   POST /api/v1/products
// @access  Private/Supplier
export const createProduct = async (req, res) => {
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
        }
        catch (redisErr) {
            console.error('Redis cache invalidation error:', redisErr);
        }
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Get logged in supplier's inventory
// @route   GET /api/v1/products/inventory
// @access  Private/Supplier
export const getMyInventory = async (req, res) => {
    try {
        const products = await Product.find({ supplier: req.user?._id }).populate('category', 'name');
        res.json({ success: true, count: products.length, data: products });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Update product availability
// @route   PATCH /api/v1/products/:id/availability
// @access  Private/Supplier
export const toggleProductAvailability = async (req, res) => {
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
        }
        catch (redisErr) {
            console.error('Redis cache invalidation error:', redisErr);
        }
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
// @desc    Get all available products (For Buyers to search/filter)
// @route   GET /api/v1/products
// @access  Private/Buyer
export const getProducts = async (req, res) => {
    try {
        const keywordParam = req.query.keyword;
        // Create cache key based on keyword
        const cacheKey = keywordParam ? `products:search:${keywordParam.toLowerCase()}` : 'products:all';
        try {
            // 1. Check if data is in Redis
            const cachedProducts = await redis.get(cacheKey);
            if (cachedProducts) {
                res.json({ success: true, source: 'cache', count: JSON.parse(cachedProducts).length, data: JSON.parse(cachedProducts) });
                return;
            }
        }
        catch (redisErr) {
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
        }
        catch (redisErr) {
            console.error('Redis SETEX error:', redisErr);
        }
        res.json({ success: true, source: 'database', count: products.length, data: products });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
