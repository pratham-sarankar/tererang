import express from 'express';
import Order from '../models/Order.js';
import adminAuth from '../middleware/authMiddleware.js';

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
    updatedAt: order.updatedAt,
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
