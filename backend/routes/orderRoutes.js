import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const serializeOrder = (order) => ({
    id: order._id,
    subtotal: order.subtotal,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentReference: order.paymentReference,
    notes: order.notes,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        height: item.height,
        image: item.image,
    })),
});

router.use(protect);

router.post('/', async (req, res) => {
    try {
        const { paymentReference, notes } = req.body;

        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        const items = user.cart.map((item) => {
            const productDoc = item.product;
            return {
                product: productDoc?._id || item.product,
                name: productDoc?.name || 'Product',
                price: productDoc?.price || 0,
                quantity: item.quantity || 1,
                size: item.size,
                height: item.height,
                image: productDoc?.image || productDoc?.images?.[0] || '',
            };
        });

        const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);

        const order = await Order.create({
            user: req.user._id,
            items,
            subtotal,
            paymentMethod: 'upi',
            paymentStatus: 'paid',
            paymentReference,
            notes,
        });

        user.cart = [];
        await user.save();

        return res.status(201).json({
            message: 'Order placed successfully',
            order: serializeOrder(order),
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.json({
            orders: orders.map(serializeOrder),
        });
    } catch (error) {
        console.error('List orders error:', error);
        return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

export default router;
