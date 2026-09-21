import express from 'express';
import multer from 'multer';
import path from 'path';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import authMiddleware from '../middleware/authMiddleware.js';
import GoogleCloudStorage, { deleteFileFromGCS } from '../utils/cloudStorage.js';

const router = express.Router();

// Multer storage configuration for category cover images
const storage = new GoogleCloudStorage({
    destination: 'images/',
    filename: (req, file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return 'category-' + uniqueSuffix + path.extname(file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed for cover image!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const slugify = (text) => {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Helper to count products for each category
const getProductCounts = async () => {
    const products = await Product.find({}, 'category').lean();
    const countMap = {};
    for (const p of products) {
        if (!p.category) continue;
        const normalized = String(p.category).trim().toLowerCase();
        countMap[normalized] = (countMap[normalized] || 0) + 1;
    }
    return countMap;
};

// GET /api/categories - Public list with product counts
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 }).lean();
        const countMap = await getProductCounts();

        const categoriesWithCount = categories.map((cat) => {
            const slugKey = String(cat.slug || '').trim().toLowerCase();
            const titleKey = String(cat.title || '').trim().toLowerCase();

            let count = 0;
            if (slugKey && countMap[slugKey]) {
                count += countMap[slugKey];
            }
            if (titleKey && titleKey !== slugKey && countMap[titleKey]) {
                count += countMap[titleKey];
            }

            return {
                ...cat,
                productCount: count,
            };
        });

        res.json({
            categories: categoriesWithCount,
            total: categoriesWithCount.length
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
});

// GET /api/categories/:id - Get single category details
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).lean();
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const countMap = await getProductCounts();
        const slugKey = String(category.slug || '').trim().toLowerCase();
        const titleKey = String(category.title || '').trim().toLowerCase();

        let count = 0;
        if (slugKey && countMap[slugKey]) count += countMap[slugKey];
        if (titleKey && titleKey !== slugKey && countMap[titleKey]) count += countMap[titleKey];

        res.json({
            category: {
                ...category,
                productCount: count
            }
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Failed to fetch category', error: error.message });
    }
});

// POST /api/categories - Create category (admin only)
router.post('/', authMiddleware, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, description } = req.body;
        let slug = req.body.slug ? slugify(req.body.slug) : slugify(title);

        if (!title || !title.trim()) {
            if (req.file) {
                await deleteFileFromGCS(req.file.filename);
            }
            return res.status(400).json({ message: 'Category title is required' });
        }

        let coverImage = req.file ? req.file.publicUrl : req.body.coverImage;
        let coverImagePath = req.file ? (req.file.path || req.file.filename) : '';

        if (!coverImage) {
            return res.status(400).json({ message: 'Cover image is required' });
        }

        // Check if slug exists, make unique if needed
        let existing = await Category.findOne({ slug });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        const category = new Category({
            title: title.trim(),
            slug,
            description: (description || '').trim(),
            coverImage,
            coverImagePath,
        });

        await category.save();

        res.status(201).json({
            message: 'Category created successfully',
            category: {
                ...category.toObject(),
                productCount: 0
            }
        });
    } catch (error) {
        console.error('Create category error:', error);
        if (req.file) {
            try {
                await deleteFileFromGCS(req.file.filename);
            } catch (unlinkErr) {
                console.warn('Failed to clean up uploaded cover image on error:', unlinkErr);
            }
        }
        res.status(500).json({ message: 'Failed to create category', error: error.message });
    }
});

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id', authMiddleware, upload.single('coverImage'), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            if (req.file) {
                await deleteFileFromGCS(req.file.filename);
            }
            return res.status(404).json({ message: 'Category not found' });
        }

        const { title, description, slug } = req.body;

        if (title && title.trim()) {
            category.title = title.trim();
        }

        if (description !== undefined) {
            category.description = description.trim();
        }

        if (slug && slugify(slug) !== category.slug) {
            const newSlug = slugify(slug);
            const slugTaken = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
            if (!slugTaken) {
                category.slug = newSlug;
            }
        }

        // Handle cover image replacement
        if (req.file) {
            // Delete old cover image from GCS if one existed
            const oldImage = category.coverImagePath || category.coverImage;
            if (oldImage) {
                try {
                    await deleteFileFromGCS(oldImage);
                } catch (err) {
                    console.warn('[categoryRoutes] Error deleting old cover image:', err.message);
                }
            }

            category.coverImage = req.file.publicUrl;
            category.coverImagePath = req.file.path || req.file.filename;
        } else if (req.body.coverImage && req.body.coverImage !== category.coverImage) {
            category.coverImage = req.body.coverImage;
        }

        await category.save();

        const countMap = await getProductCounts();
        const slugKey = String(category.slug || '').trim().toLowerCase();
        const titleKey = String(category.title || '').trim().toLowerCase();

        let count = 0;
        if (slugKey && countMap[slugKey]) count += countMap[slugKey];
        if (titleKey && titleKey !== slugKey && countMap[titleKey]) count += countMap[titleKey];

        res.json({
            message: 'Category updated successfully',
            category: {
                ...category.toObject(),
                productCount: count
            }
        });
    } catch (error) {
        console.error('Update category error:', error);
        if (req.file) {
            try {
                await deleteFileFromGCS(req.file.filename);
            } catch (unlinkErr) {
                console.warn('Failed to clean up uploaded cover image on error:', unlinkErr);
            }
        }
        res.status(500).json({ message: 'Failed to update category', error: error.message });
    }
});

// DELETE /api/categories/:id - Delete category and remove cover image from cloud storage
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Delete cover image from Firebase Storage / Google Cloud Storage
        const imageToDelete = category.coverImagePath || category.coverImage;
        if (imageToDelete) {
            try {
                const deleted = await deleteFileFromGCS(imageToDelete);
                console.log(`[categoryRoutes] Category cover image deleted from cloud storage: ${imageToDelete} (result: ${deleted})`);
            } catch (err) {
                console.warn(`[categoryRoutes] Failed to delete cover image ${imageToDelete} from cloud storage:`, err.message);
            }
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Category and its cover image were deleted successfully',
            deletedCategoryId: req.params.id
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Failed to delete category', error: error.message });
    }
});

export default router;
