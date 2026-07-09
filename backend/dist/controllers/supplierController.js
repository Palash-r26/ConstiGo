import { User } from '../models/User.js';
// @desc    Get nearby suppliers
// @route   GET /api/v1/suppliers
// @access  Private/Buyer
export const getNearbySuppliers = async (req, res) => {
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
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseInt(distance, 10),
                },
            },
        }).select('-password');
        res.json({ success: true, count: suppliers.length, data: suppliers });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
