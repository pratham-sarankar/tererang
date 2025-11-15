import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const mapCartResponse = (cart = []) => {
    const items = cart.map((item) => {
        const product = item.product && typeof item.product === 'object'
            ? {
                id: item.product._id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                images: item.product.images,
                inStock: item.product.inStock,
            }
            : null;

        return {
            id: item._id,
            product,
            quantity: item.quantity,
            size: item.size,
            height: item.height,
            addedAt: item.addedAt,
            lineTotal: Number((item.quantity || 0) * (product?.price || 0)),
        };
    });

    const subtotal = items.reduce((acc, item) => acc + (item.lineTotal || 0), 0);
    const count = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

    return {
        items,
        subtotal,
        count,
    };
};

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(mapCartResponse(user.cart));
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { productId, quantity = 1, size, height } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const safeQty = Number(quantity) > 0 ? Number(quantity) : 1;

        const existingItem = user.cart.find(
            (item) =>
                item.product.toString() === productId &&
                (item.size || null) === (size || null) &&
                (item.height || null) === (height || null)
        );

        if (existingItem) {
            existingItem.quantity += safeQty;
            if (size) existingItem.size = size;
            if (height) existingItem.height = height;
        } else {
            user.cart.push({
                product: productId,
                quantity: safeQty,
                size,
                height,
            });
        }

        await user.save();
        await user.populate('cart.product');

        return res.status(201).json({
            message: 'Cart updated',
            ...mapCartResponse(user.cart),
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ message: 'Failed to add to cart', error: error.message });
    }
});

router.patch('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity, size, height } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItem = user.cart.id(itemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        if (quantity !== undefined) {
            const parsedQty = Number(quantity);
            if (Number.isNaN(parsedQty) || parsedQty < 1) {
                return res.status(400).json({ message: 'Quantity must be at least 1' });
            }
            cartItem.quantity = parsedQty;
        }

        if (size !== undefined) {
            cartItem.size = size;
        }

        if (height !== undefined) {
            cartItem.height = height;
        }

        await user.save();
        await user.populate('cart.product');

        return res.json({
            message: 'Cart item updated',
            ...mapCartResponse(user.cart),
        });
    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({ message: 'Failed to update cart item', error: error.message });
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItem = user.cart.id(itemId);
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        cartItem.deleteOne();

        await user.save();
        await user.populate('cart.product');

        return res.json({
            message: 'Item removed from cart',
            ...mapCartResponse(user.cart),
        });
    } catch (error) {
        console.error('Delete cart error:', error);
        return res.status(500).json({ message: 'Failed to remove cart item', error: error.message });
    }
});

router.delete('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = [];
        await user.save();

        return res.json({ message: 'Cart cleared', items: [], subtotal: 0, count: 0 });
    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({ message: 'Failed to clear cart', error: error.message });
    }
});

export default router;
