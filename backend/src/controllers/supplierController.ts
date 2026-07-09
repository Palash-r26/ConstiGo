import { Request, Response } from 'express';
import { User } from '../models/User.js';

// @desc    Get nearby suppliers
// @route   GET /api/v1/suppliers
// @access  Private/Buyer
export const getNearbySuppliers = async (req: Request, res: Response) => {
  try {
    const { lng, lat, distance = 10000 } = req.query; // distance in meters

    if (!lng || !lat) {
      res.status(400);
      throw new Error('Please provide longitude and latitude');
    }

    const suppliers = await User.find({
      role: 'SUPPLIER',
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng as string), parseFloat(lat as string)],
          },
          $maxDistance: parseInt(distance as string, 10),
        },
      },
    }).select('-password');

    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
