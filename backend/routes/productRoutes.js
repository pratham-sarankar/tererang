import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/authMiddleware.js';
import GoogleCloudStorage, { deleteFileFromGCS, getPublicUrl } from '../utils/cloudStorage.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for Google Cloud Storage uploads
const storage = new GoogleCloudStorage({
    destination: 'images/',
    filename: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
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

const normalizeSizeValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value).trim();
};

const parseSizeStockInput = (rawValue) => {
    if (!rawValue) return [];
    let parsed = rawValue;

    if (typeof rawValue === 'string') {
        try {
            parsed = JSON.parse(rawValue);
        } catch (error) {
            console.warn('[productRoutes] Failed to parse sizeStock JSON, ignoring field');
            return [];
        }
    }

    if (!Array.isArray(parsed)) {
        return [];
    }

    return parsed
        .map((entry) => {
            if (!entry) return null;
            const size = normalizeSizeValue(entry.size || entry.label);
            if (!size) return null;
            const qty = Number(entry.quantity ?? entry.qty ?? entry.stock ?? entry.value ?? 0);
            return {
                size,
                quantity: Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0,
            };
        })
        .filter(Boolean);
};

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

// Create new product (admin only) - supports multiple images
router.post('/', authMiddleware, upload.array('images', 8), async (req, res) => {
    try {
        const { name, price, description, category, inStock } = req.body;

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({
                message: 'Name and price are required'
            });
        }

        // Check if at least one image was uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'At least one product image is required'
            });
        }

        // Verify that all files have public URLs
        const hasValidUrls = req.files.every(file => file.publicUrl);
        if (!hasValidUrls) {
            return res.status(500).json({
                message: 'Failed to upload images to cloud storage'
            });
        }

        const sizeStock = parseSizeStockInput(req.body.sizeStock);

        const productData = {
            name,
            price: parseFloat(price),
            image: req.files[0].publicUrl, // Store full URL instead of filename
            images: req.files.map(f => f.filename), // Keep filenames for deletion purposes
            imageUrls: req.files.map(f => f.publicUrl), // Store public URLs for frontend
            description: description || '',
            category: category || 'kurti',
            inStock: inStock !== 'false',
            sizeStock,
        };

        if (sizeStock.length > 0) {
            productData.inStock = sizeStock.some((entry) => entry.quantity > 0);
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        console.error('Create product error:', error);

        // Delete uploaded files if product creation fails
        if (req.files && req.files.length > 0) {
            await Promise.all(
                req.files.map(async (file) => {
                    try {
                        await deleteFileFromGCS(file.filename);
                    } catch (unlinkError) {
                        console.error('Error deleting file from GCS:', unlinkError);
                    }
                })
            );
        }

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Update product (admin only) - supports replacing images
router.put('/:id', authMiddleware, upload.array('images', 8), async (req, res) => {
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

        const sizeStock = parseSizeStockInput(req.body.sizeStock);
        if (sizeStock.length > 0 || req.body.sizeStock === '[]') {
            updateData.sizeStock = sizeStock;
            updateData.inStock = sizeStock.some((entry) => entry.quantity > 0);
        }

        // Handle images update: if new files provided, replace all images
        if (req.files && req.files.length > 0) {
            // Delete old image files from Google Cloud Storage
            const oldFiles = Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : (product.image ? [product.image] : []);

            await Promise.all(
                oldFiles.map(async (filename) => {
                    try {
                        await deleteFileFromGCS(filename);
                    } catch (error) {
                        console.error('Error deleting old image from GCS:', error);
                    }
                })
            );

            updateData.images = req.files.map(f => f.filename); // Keep filenames for deletion
            updateData.imageUrls = req.files.map(f => f.publicUrl); // Store public URLs for frontend
            updateData.image = req.files[0].publicUrl; // Store full URL as primary image
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

        // Delete uploaded files if update fails
        if (req.files && req.files.length > 0) {
            await Promise.all(
                req.files.map(async (file) => {
                    try {
                        await deleteFileFromGCS(file.filename);
                    } catch (unlinkError) {
                        console.error('Error deleting file from GCS:', unlinkError);
                    }
                })
            );
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

        // Delete image files from Google Cloud Storage (all if array exists, else legacy single)
        const filesToDelete = Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : (product.image ? [product.image] : []);

        await Promise.all(
            filesToDelete.map(async (filename) => {
                try {
                    await deleteFileFromGCS(filename);
                } catch (error) {
                    console.error('Error deleting image file from GCS:', error);
                }
            })
        );

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