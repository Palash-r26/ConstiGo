import { Request, Response } from 'express';
import { Category } from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public (or Private depending on requirements, usually Public)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
