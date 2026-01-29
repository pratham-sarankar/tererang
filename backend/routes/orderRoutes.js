import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOrderConfirmationEmail, sendCustomerOrderStatusEmail, checkSmtpConnectivity } from '../utils/emailService.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { COD_ADVANCE_AMOUNT } from '../config/constants.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();
const resolveGstRate = () => {
    return 0;
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
    codAdvancePayment: order.codAdvancePayment || 0,
    codAdvanceReference: order.codAdvanceReference || '',
    codRemainingPayment: order.codRemainingPayment || 0,
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

router.post('/create-razorpay-order', async (req, res) => {
    try {
        const { addressId, paymentType = 'full' } = req.body;
        console.info('[orderRoutes] Initiating Razorpay order', { userId: req.user._id, paymentType });

        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user || !user.cart?.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const items = user.cart.map((item) => {
            const productDoc = item.product;
            return {
                price: productDoc?.price || 0,
                quantity: item.quantity || 1,
            };
        });

        const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);
        const taxAmount = Number((subtotal * GST_RATE).toFixed(2));
        const grandTotal = subtotal + taxAmount;
        
        // Determine amount based on payment type
        let amountToPay = grandTotal;
        if (paymentType === 'cod_advance') {
            // Validate that order total is at least the advance amount
            if (grandTotal < COD_ADVANCE_AMOUNT) {
                return res.status(400).json({ 
                    message: `Order total must be at least ₹${COD_ADVANCE_AMOUNT} for COD orders` 
                });
            }
            amountToPay = COD_ADVANCE_AMOUNT;
        }
        
        const amountInPaise = Math.round(amountToPay * 100);

        if (amountInPaise <= 0) {
            return res.status(400).json({ message: 'Invalid order amount' });
        }

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);

        console.info('[orderRoutes] Razorpay order created', {
            razorpayOrderId: order.id,
            amount: order.amount,
            paymentType
        });

        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID,
            paymentType,
            grandTotal: Math.round(grandTotal * 100), // Total order value in paise
            prefill: {
                name: user.name || '',
                email: user.email || '',
                contact: user.phoneNumber || ''
            }
        });

    } catch (error) {
        console.error('[orderRoutes] Razorpay order creation failed', error);
        res.status(500).json({ message: 'Failed to create payment order', error: error.message });
    }
});

router.post('/verify-payment', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            addressId,
            notes,
            paymentType = 'full'
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn('[orderRoutes] Invalid signature', { razorpay_order_id, razorpay_payment_id });
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Payment verified, now create order in DB
        const user = await User.findById(req.user._id).populate('cart.product');
        const selectedAddress = findAddressById(user, addressId);

        if (!selectedAddress) {
            return res.status(400).json({ message: 'Address not found' });
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
        const taxAmount = Number((subtotal * GST_RATE).toFixed(2));
        const grandTotal = subtotal + taxAmount;

        // Create order with appropriate payment details based on type
        const orderData = {
            user: req.user._id,
            items,
            shippingAddress: snapshotAddress(selectedAddress),
            subtotal,
            taxAmount,
            grandTotal,
            status: 'confirmed',
            notes,
        };

        if (paymentType === 'cod_advance') {
            // COD order with advance payment
            orderData.paymentMethod = 'cod';
            orderData.paymentStatus = 'partially_paid';
            orderData.codAdvancePayment = COD_ADVANCE_AMOUNT;
            orderData.codAdvanceReference = razorpay_payment_id;
            orderData.codRemainingPayment = grandTotal - COD_ADVANCE_AMOUNT;
            orderData.paymentReference = razorpay_payment_id;
        } else {
            // Full payment
            orderData.paymentMethod = 'razorpay';
            orderData.paymentStatus = 'paid';
            orderData.paymentReference = razorpay_payment_id;
        }

        const order = await Order.create(orderData);

        user.cart = [];
        await user.save();

        // Send email
        try {
            // Notify Admin
            await sendOrderConfirmationEmail({
                order,
                user: {
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                },
            });
            // Notify Customer
            await sendCustomerOrderStatusEmail({
                order,
                user: {
                    name: user.name,
                    email: user.email,
                },
                type: 'confirmed'
            });
        } catch (emailError) {
            console.error('[orderRoutes] Order email error', emailError);
        }

        res.status(201).json({
            message: 'Payment verified and order placed',
            order: serializeOrder(order),
        });

    } catch (error) {
        console.error('[orderRoutes] Payment verification failed', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
});

export default router;
