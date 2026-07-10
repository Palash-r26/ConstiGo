import { Cart } from '../models/Cart.js';
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user?.id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user?.id, items: [] });
        }
        res.status(200).json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.user?.id });
        if (!cart) {
            cart = await Cart.create({
                user: req.user?.id,
                items: [{ product: productId, quantity: quantity || 1 }]
            });
        }
        else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += (quantity || 1);
            }
            else {
                cart.items.push({ product: productId, quantity: quantity || 1 });
            }
            await cart.save();
        }
        cart = await cart.populate('items.product');
        res.status(200).json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user?.id });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
            else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
        }
        await cart.populate('items.product');
        res.status(200).json({ success: true, data: cart });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ user: req.user?.id });
        if (cart) {
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
            await cart.populate('items.product');
            return res.status(200).json({ success: true, data: cart });
        }
        res.status(404).json({ success: false, message: 'Cart not found' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user?.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ success: true, data: { items: [] } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
