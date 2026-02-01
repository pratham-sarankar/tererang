import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import adminAuth from '../middleware/authMiddleware.js';
import { sendCustomerOrderStatusEmail } from '../utils/emailService.js';

const router = express.Router();

const serializeOrder = (order) => ({
    id: order._id,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    codCharge: order.codCharge,
    grandTotal: order.grandTotal,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentReference: order.paymentReference,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippingAddress: order.shippingAddress,
    user: order.user
        ? {
            id: order.user._id,
            name: order.user.name,
            email: order.user.email,
            phoneNumber: order.user.phoneNumber,
        }
        : null,
    items: (order.items || []).map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        height: item.height,
        image: item.image,
    })),
});

const loadOrderWithUser = (orderId) => Order.findById(orderId).populate('user', 'name email phoneNumber');

const normalizeSizeKey = (size) => String(size || '').trim().toLowerCase();

const adjustInventoryForOrder = async (orderDoc) => {
    const orderItems = Array.isArray(orderDoc.items) ? orderDoc.items : [];
    if (orderItems.length === 0) {
        return [];
    }

    const productIds = orderItems
        .map((item) => item?.product)
        .filter(Boolean)
        .map((id) => id.toString());

    if (productIds.length === 0) {
        return [];
    }

    const uniqueIds = [...new Set(productIds)];
    const products = await Product.find({ _id: { $in: uniqueIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const touchedProductIds = new Set();
    const adjustments = [];

    orderItems.forEach((item) => {
        const productId = item?.product ? item.product.toString() : null;
        const sizeLabel = normalizeSizeKey(item?.size);
        if (!productId || !sizeLabel) {
            return;
        }

        const product = productMap.get(productId);
        if (!product || !Array.isArray(product.sizeStock) || product.sizeStock.length === 0) {
            return;
        }

        const variant = product.sizeStock.find((entry) => normalizeSizeKey(entry?.size) === sizeLabel);
        if (!variant) {
            return;
        }

        const quantityToDeduct = Math.max(1, Number(item.quantity) || 1);
        const nextQuantity = Math.max(0, (variant.quantity || 0) - quantityToDeduct);
        variant.quantity = nextQuantity;
        product.inStock = product.sizeStock.some((entry) => (entry.quantity || 0) > 0);
        product.markModified('sizeStock');
        touchedProductIds.add(productId);
        adjustments.push({
            productId,
            size: variant.size,
            deducted: quantityToDeduct,
            remaining: nextQuantity,
        });
    });

    await Promise.all(
        Array.from(touchedProductIds).map(async (productId) => {
            const product = productMap.get(productId);
            if (!product) return null;
            try {
                await product.save();
                return product;
            } catch (error) {
                console.error('[adminOrderRoutes] Failed to update product stock', {
                    productId,
                    error: error.message,
                });
                throw error;
            }
        })
    );

    return adjustments;
};

router.use(adminAuth);

// List all orders (optionally filter by status)
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email phoneNumber')
            .sort({ createdAt: -1 });

        return res.json({
            orders: orders.map(serializeOrder),
        });
    } catch (error) {
        console.error('[adminOrderRoutes] List orders error', error);
        return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// Get single order by id
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phoneNumber');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.json({ order: serializeOrder(order) });
    } catch (error) {
        console.error('[adminOrderRoutes] Get order error', error);
        return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
});

// Update order fields (status, payment info, notes)
router.put('/:id', async (req, res) => {
    try {
        const allowedFields = ['status', 'paymentStatus', 'paymentMethod', 'paymentReference', 'notes'];
        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        }).populate('user', 'name email phoneNumber');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.json({
            message: 'Order updated successfully',
            order: serializeOrder(order),
        });
    } catch (error) {
        console.error('[adminOrderRoutes] Update order error', error);
        return res.status(500).json({ message: 'Failed to update order', error: error.message });
    }
});

router.post('/:id/confirm', async (req, res) => {
    try {
        const order = await loadOrderWithUser(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cancelled orders cannot be confirmed' });
        }

        if (order.status === 'confirmed') {
            return res.json({ message: 'Order already confirmed', order: serializeOrder(order) });
        }

        order.status = 'confirmed';
        if (order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
        }

        await order.save();
        await order.populate('user', 'name email phoneNumber');

        let inventoryAdjustments = [];
        try {
            inventoryAdjustments = await adjustInventoryForOrder(order);
            if (inventoryAdjustments.length > 0) {
                console.info('[adminOrderRoutes] Inventory adjusted for order confirmation', {
                    orderId: order._id,
                    adjustments: inventoryAdjustments,
                });
            }
        } catch (inventoryError) {
            console.error('[adminOrderRoutes] Inventory adjustment failed', {
                orderId: order._id,
                error: inventoryError.message,
            });
        }

        try {
            await sendCustomerOrderStatusEmail({ order, user: order.user, type: 'confirmed' });
        } catch (emailError) {
            console.error('[adminOrderRoutes] Customer confirm email failed', {
                orderId: order._id,
                error: emailError.message,
            });
        }

        return res.json({
            message: 'Order confirmed and customer notified',
            order: serializeOrder(order),
            inventoryAdjustments,
        });
    } catch (error) {
        console.error('[adminOrderRoutes] Confirm order error', error);
        return res.status(500).json({ message: 'Failed to confirm order', error: error.message });
    }
});

router.post('/:id/cancel', async (req, res) => {
    try {
        const order = await loadOrderWithUser(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'cancelled') {
            return res.json({ message: 'Order already cancelled', order: serializeOrder(order) });
        }

        const { reason } = req.body || {};
        order.status = 'cancelled';
        if (reason) {
            order.notes = [order.notes, reason].filter(Boolean).join(' | ');
        }

        await order.save();
        await order.populate('user', 'name email phoneNumber');

        try {
            await sendCustomerOrderStatusEmail({ order, user: order.user, type: 'cancelled', reason });
        } catch (emailError) {
            console.error('[adminOrderRoutes] Customer cancel email failed', {
                orderId: order._id,
                error: emailError.message,
            });
        }

        return res.json({
            message: 'Order cancelled and customer notified',
            order: serializeOrder(order),
        });
    } catch (error) {
        console.error('[adminOrderRoutes] Cancel order error', error);
        return res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
});

// Delete order
router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.deleteOne();
        return res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('[adminOrderRoutes] Delete order error', error);
        return res.status(500).json({ message: 'Failed to delete order', error: error.message });
    }
});

export default router;
