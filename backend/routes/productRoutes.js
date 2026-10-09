import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import authMiddleware from '../middleware/authMiddleware.js';
import GoogleCloudStorage, { deleteFileFromGCS, deleteProductStorageImages, getPublicUrl } from '../utils/cloudStorage.js';

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

const escapeRegex = (string) => String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveCategoryDoc = async (categoryInput) => {
    if (!categoryInput) return null;
    const trimmed = String(categoryInput).trim();
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
        const cat = await Category.findById(trimmed);
        if (cat) return cat;
    }
    return await Category.findOne({
        $or: [
            { slug: trimmed.toLowerCase() },
            { title: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') },
            { name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') }
        ]
    });
};

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

// Get all products (public route) - supports search, category, price range, inStock, size, and sorting
router.get('/', async (req, res) => {
    try {
        const {
            category,
            inStock,
            search,
            minPrice,
            maxPrice,
            size,
            sort = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        const filter = {};

        // 1. Search filter across name, description, and category
        if (search && search.trim()) {
            const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(escaped, 'i');

            // Find categories matching search text
            const matchedCats = await Category.find({
                $or: [
                    { title: searchRegex },
                    { slug: searchRegex },
                    { name: searchRegex }
                ]
            }, '_id').lean();
            const matchedCatIds = matchedCats.map((c) => c._id);

            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                ...(matchedCatIds.length > 0 ? [{ category: { $in: matchedCatIds } }] : [])
            ];
        }

        // 2. Category filter (supports ObjectId, slug, or title, single or comma-separated)
        if (category && category.trim() && category.toLowerCase() !== 'all') {
            const cats = category
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean);

            const matchedCategoryIds = [];
            for (const catTerm of cats) {
                if (mongoose.Types.ObjectId.isValid(catTerm)) {
                    matchedCategoryIds.push(new mongoose.Types.ObjectId(catTerm));
                }
                const foundCats = await Category.find({
                    $or: [
                        { slug: catTerm.toLowerCase() },
                        { title: new RegExp(`^${escapeRegex(catTerm)}$`, 'i') },
                        { name: new RegExp(`^${escapeRegex(catTerm)}$`, 'i') }
                    ]
                }, '_id').lean();
                for (const fc of foundCats) {
                    matchedCategoryIds.push(fc._id);
                }
            }

            if (matchedCategoryIds.length > 0) {
                filter.category = { $in: matchedCategoryIds };
            } else {
                // If nonexistent category specified, return empty
                filter.category = new mongoose.Types.ObjectId();
            }
        }

        // 3. Stock availability filter
        if (inStock !== undefined && inStock !== '') {
            if (inStock === 'true' || inStock === true) {
                filter.inStock = true;
            } else if (inStock === 'false' || inStock === false) {
                filter.inStock = false;
            }
        }

        // 4. Price range filter
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        if (!isNaN(min) || !isNaN(max)) {
            filter.price = {};
            if (!isNaN(min) && min >= 0) filter.price.$gte = min;
            if (!isNaN(max) && max >= 0) filter.price.$lte = max;
        }

        // 5. Size filter (check sizeStock matching sizes with positive quantity)
        if (size && size.trim() && size.toLowerCase() !== 'all') {
            const sizes = size
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            if (sizes.length > 0) {
                const sizeRegexList = sizes.map((s) => new RegExp(`^${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'));
                filter.sizeStock = {
                    $elemMatch: {
                        size: { $in: sizeRegexList },
                        quantity: { $gt: 0 }
                    }
                };
            }
        }

        // 6. Sorting
        let sortOption = { createdAt: -1 };
        switch (sort) {
            case 'price-asc':
            case 'price-low-high':
                sortOption = { price: 1, _id: 1 };
                break;
            case 'price-desc':
            case 'price-high-low':
                sortOption = { price: -1, _id: 1 };
                break;
            case 'name-asc':
            case 'title-asc':
                sortOption = { name: 1, _id: 1 };
                break;
            case 'name-desc':
            case 'title-desc':
                sortOption = { name: -1, _id: 1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1, _id: 1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1, _id: 1 };
                break;
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * limitNum;

        const products = await Product.find(filter)
            .populate('category', 'title name slug coverImage description')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum) || 1,
                total,
                limit: limitNum
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
        const product = await Product.findById(req.params.id)
            .populate('category', 'title name slug coverImage description');
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

        // Resolve and validate category
        const categoryDoc = await resolveCategoryDoc(category);
        if (!categoryDoc) {
            return res.status(400).json({
                message: 'A valid category is required. Selected category does not exist.'
            });
        }

        const productData = {
            name,
            price: parseFloat(price),
            image: req.files[0].publicUrl, // Store full URL instead of filename
            images: req.files.map(f => f.filename), // Keep filenames for deletion purposes
            imageUrls: req.files.map(f => f.publicUrl), // Store public URLs for frontend
            description: description || '',
            category: categoryDoc._id,
            inStock: inStock !== 'false',
            sizeStock,
        };

        if (sizeStock.length > 0) {
            productData.inStock = sizeStock.some((entry) => entry.quantity > 0);
        }

        const product = new Product(productData);
        await product.save();
        await product.populate('category', 'title name slug coverImage description');

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
        if (category !== undefined) {
            const categoryDoc = await resolveCategoryDoc(category);
            if (!categoryDoc) {
                return res.status(400).json({
                    message: 'A valid category is required. Selected category does not exist.'
                });
            }
            updateData.category = categoryDoc._id;
        }
        if (inStock !== undefined) updateData.inStock = inStock !== 'false';

        const sizeStock = parseSizeStockInput(req.body.sizeStock);
        if (sizeStock.length > 0 || req.body.sizeStock === '[]') {
            updateData.sizeStock = sizeStock;
            updateData.inStock = sizeStock.some((entry) => entry.quantity > 0);
        }

        // Handle images update: if new files provided, replace all images
        if (req.files && req.files.length > 0) {
            // Delete old image files from Firebase Storage
            await deleteProductStorageImages(product);

            updateData.images = req.files.map(f => f.filename); // Keep filenames for deletion
            updateData.imageUrls = req.files.map(f => f.publicUrl); // Store public URLs for frontend
            updateData.image = req.files[0].publicUrl; // Store full URL as primary image
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'title name slug coverImage description');

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

// Delete individual image from product (admin only)
router.delete('/:id/images/:imageIndex', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const imageIndex = parseInt(req.params.imageIndex, 10);
        const totalImages = Math.max(
            Array.isArray(product.images) ? product.images.length : 0,
            Array.isArray(product.imageUrls) ? product.imageUrls.length : 0
        );

        // Validate index
        if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= totalImages) {
            return res.status(400).json({
                message: 'Invalid image index'
            });
        }

        // Get image reference (filename or URL) for Firebase Storage deletion
        const imageRefToDelete = product.images?.[imageIndex] || product.imageUrls?.[imageIndex];

        // Delete from Firebase Storage (log but don't fail if file doesn't exist)
        if (imageRefToDelete) {
            try {
                await deleteFileFromGCS(imageRefToDelete);
            } catch (error) {
                console.error(`Error deleting image ${imageRefToDelete} from Firebase Storage:`, error);
                // Continue with database update even if cloud delete fails
            }
        }

        // Remove from both arrays at the same index
        if (Array.isArray(product.images) && product.images.length > imageIndex) {
            product.images.splice(imageIndex, 1);
        }
        if (Array.isArray(product.imageUrls) && product.imageUrls.length > imageIndex) {
            product.imageUrls.splice(imageIndex, 1);
        }

        // Handle edge case: if no images left, clear all image fields
        if ((!product.images || product.images.length === 0) && (!product.imageUrls || product.imageUrls.length === 0)) {
            product.image = '';
            product.images = [];
            product.imageUrls = [];
        } else {
            // Sync primary image from first URL
            product.image = product.imageUrls?.[0] || '';
        }

        await product.save();

        res.json(product);

    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Add images to existing product (admin only)
router.post('/:id/images', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        // Validate that files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'No images provided'
            });
        }

        // Append new images to existing arrays
        const newFilenames = req.files.map(f => f.filename);
        const newUrls = req.files.map(f => f.publicUrl);

        product.images = [...product.images, ...newFilenames];
        product.imageUrls = [...product.imageUrls, ...newUrls];

        // Set primary image if it was empty
        if (!product.image || product.image.length === 0) {
            product.image = product.imageUrls[0];
        }

        await product.save();

        res.json(product);

    } catch (error) {
        console.error('Add images error:', error);

        // Delete uploaded files if operation fails
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

// Reorder product images (admin only)
router.put('/:id/images/reorder', authMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const { newOrder } = req.body;

        // Validate newOrder array
        if (!Array.isArray(newOrder)) {
            return res.status(400).json({
                message: 'newOrder must be an array'
            });
        }

        if (newOrder.length !== product.images.length) {
            return res.status(400).json({
                message: 'newOrder length must match current images count'
            });
        }

        // Validate all indices are valid and unique
        const validIndices = new Set(newOrder);
        if (validIndices.size !== newOrder.length) {
            return res.status(400).json({
                message: 'newOrder contains duplicate indices'
            });
        }

        for (const index of newOrder) {
            if (!Number.isInteger(index) || index < 0 || index >= product.images.length) {
                return res.status(400).json({
                    message: 'Invalid index in newOrder'
                });
            }
        }

        // Reorder both arrays
        const reorderedImages = newOrder.map(i => product.images[i]);
        const reorderedUrls = newOrder.map(i => product.imageUrls[i]);

        product.images = reorderedImages;
        product.imageUrls = reorderedUrls;
        product.image = reorderedUrls[0];

        await product.save();

        res.json(product);

    } catch (error) {
        console.error('Reorder images error:', error);
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

        // Delete all associated image files from Firebase Storage
        await deleteProductStorageImages(product);

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