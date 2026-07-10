import { User } from '../models/User.js';
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id).select('-password').populate('wishlist');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone, profileImage, gender, dateOfBirth } = req.body;
        const updateData = {};
        if (firstName !== undefined)
            updateData.firstName = firstName;
        if (lastName !== undefined)
            updateData.lastName = lastName;
        if (phone !== undefined)
            updateData.phone = phone;
        if (profileImage !== undefined)
            updateData.profileImage = profileImage;
        if (gender !== undefined)
            updateData.gender = gender;
        if (dateOfBirth !== undefined)
            updateData.dateOfBirth = dateOfBirth;
        const user = await User.findByIdAndUpdate(req.user?.id, updateData, { new: true, runValidators: true }).select('-password');
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// ── Favourites ──────────────────────────────────────────────
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const index = user.wishlist.findIndex(id => id.toString() === productId);
        if (index === -1) {
            user.wishlist.push(productId);
        }
        else {
            user.wishlist.splice(index, 1);
        }
        await user.save();
        res.status(200).json({ success: true, data: user.wishlist });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const getFavourites = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user.wishlist });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// ── Addresses ───────────────────────────────────────────────
export const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const { label, street, city, state, zipCode, isDefault } = req.body;
        // If setting as default, un-default the rest
        if (isDefault) {
            user.addresses.forEach(addr => { addr.isDefault = false; });
        }
        user.addresses.push({ label: label || 'Home', street, city, state, zipCode, isDefault: isDefault || user.addresses.length === 0 });
        await user.save();
        res.status(201).json({ success: true, data: user.addresses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
        await user.save();
        res.status(200).json({ success: true, data: user.addresses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
