import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOrderConfirmationEmail, checkSmtpConnectivity } from '../utils/emailService.js';

const router = express.Router();
const resolveGstRate = () => {
    const raw = Number(process.env.GST_RATE ?? process.env.GST_RATE_PERCENT ?? 0.05);
    if (!Number.isFinite(raw) || raw <= 0) return 0.05;
    return raw > 1 ? raw / 100 : raw;
};
const GST_RATE = resolveGstRate();

const serializeOrder = (order) => ({
    id: order._id,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    grandTotal: order.grandTotal,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentReference: order.paymentReference,
    notes: order.notes,
    createdAt: order.createdAt,
    shippingAddress: order.shippingAddress,
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

const findAddressById = (user, addressId) => {
    if (!addressId || !user) return null;
    if (typeof user.addresses?.id === 'function') {
        return user.addresses.id(addressId);
    }
    return (user.addresses || []).find((addr) => String(addr?._id) === String(addressId));
};

router.use(protect);

const snapshotAddress = (addressDoc) => ({
    label: addressDoc.label,
    contactName: addressDoc.contactName,
    phoneNumber: addressDoc.phoneNumber,
    line1: addressDoc.line1,
    line2: addressDoc.line2,
    landmark: addressDoc.landmark,
    city: addressDoc.city,
    state: addressDoc.state,
    postalCode: addressDoc.postalCode,
    country: addressDoc.country,
});

router.post('/', async (req, res) => {
    try {
        const { paymentReference, notes, addressId } = req.body;
        console.info('[orderRoutes] Incoming order placement request', {
            userId: req.user._id,
            paymentReference,
            addressId,
        });

        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user) {
            console.warn('[orderRoutes] User not found during order placement', { userId: req.user._id });
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.email) {
            console.warn('[orderRoutes] User missing email during order placement', { userId: req.user._id });
            return res.status(400).json({ message: 'Add your email address to your profile before placing an order' });
        }

        if (!user.cart || user.cart.length === 0) {
            console.warn('[orderRoutes] Cart empty when attempting to place order', { userId: req.user._id });
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        if (!addressId) {
            console.warn('[orderRoutes] Missing shipping address for order', { userId: req.user._id });
            return res.status(400).json({ message: 'Select a shipping address before placing your order' });
        }

        const selectedAddress = findAddressById(user, addressId);
        if (!selectedAddress) {
            console.warn('[orderRoutes] Address not found for order', { userId: req.user._id, addressId });
            return res.status(404).json({ message: 'Shipping address not found. Please re-select or add a new one.' });
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

        const taxAmount = Number((subtotal * GST_RATE).toFixed(2));
        const grandTotal = subtotal + taxAmount;

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress: snapshotAddress(selectedAddress),
            subtotal,
            taxAmount,
            grandTotal,
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
                    email: user.email,
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
