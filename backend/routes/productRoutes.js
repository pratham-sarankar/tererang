import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/images');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all products (public route)
router.get('/', async (req, res) => {
    try {
        const { category, inStock, page = 1, limit = 12 } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (inStock !== undefined) filter.inStock = inStock === 'true';

        const skip = (page - 1) * limit;
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Get single product by ID (public route)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Create new product (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category, inStock } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({
                message: 'Name and price are required'
            });
        }

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: 'Product image is required'
            });
        }

        const productData = {
            name,
            price: parseFloat(price),
            image: req.file.filename,
            description: description || '',
            category: category || 'kurti',
            inStock: inStock !== 'false'
        };

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('Create product error:', error);

        // Delete uploaded file if product creation fails
        if (req.file) {
            try {
                await fs.unlink(path.join(__dirname, '../public/images', req.file.filename));
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Update product (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category, inStock } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (price) updateData.price = parseFloat(price);
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (inStock !== undefined) updateData.inStock = inStock !== 'false';

        // Handle image update
        if (req.file) {
            // Delete old image file
            try {
                await fs.unlink(path.join(__dirname, '../public/images', product.image));
            } catch (error) {
                console.error('Error deleting old image:', error);
            }
            updateData.image = req.file.filename;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Update product error:', error);

        // Delete uploaded file if update fails
        if (req.file) {
            try {
                await fs.unlink(path.join(__dirname, '../public/images', req.file.filename));
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Delete image file
        try {
            await fs.unlink(path.join(__dirname, '../public/images', product.image));
        } catch (error) {
            console.error('Error deleting image file:', error);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

export default router;