import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOrderConfirmationEmail, checkSmtpConnectivity } from '../utils/emailService.js';

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
        console.info('[orderRoutes] Incoming order placement request', {
            userId: req.user._id,
            paymentReference,
        });

        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user) {
            console.warn('[orderRoutes] User not found during order placement', { userId: req.user._id });
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.cart || user.cart.length === 0) {
            console.warn('[orderRoutes] Cart empty when attempting to place order', { userId: req.user._id });
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        console.info('[orderRoutes] Preparing order items from cart', {
            userId: req.user._id,
            cartSize: user.cart.length,
        });

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
        console.info('[orderRoutes] Calculated order subtotal', {
            userId: req.user._id,
            subtotal,
            itemCount: items.length,
        });

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
        console.info('[orderRoutes] Order persisted and cart cleared', {
            orderId: order._id,
            userId: req.user._id,
        });

        try {
            console.info('[orderRoutes] Triggering order confirmation email', { orderId: order._id });
            await sendOrderConfirmationEmail({
                order,
                user: {
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                },
            });
            console.info('[orderRoutes] Order confirmation email triggered successfully', {
                orderId: order._id,
            });
        } catch (emailError) {
            console.error('[orderRoutes] Order email error', {
                orderId: order._id,
                error: emailError.message,
            });
        }

        return res.status(201).json({
            message: 'Order placed successfully',
            order: serializeOrder(order),
        });
    } catch (error) {
        console.error('[orderRoutes] Create order error', {
            userId: req.user?._id,
            error: error.message,
        });
        return res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

router.get('/smtp-health', async (req, res) => {
    try {
        const result = await checkSmtpConnectivity();
        if (result.ok) {
            return res.json(result);
        }
        return res.status(503).json(result);
    } catch (error) {
        console.error('SMTP health check error:', error);
        return res.status(500).json({
            ok: false,
            status: 'error',
            message: error.message,
        });
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
