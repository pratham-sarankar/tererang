import express from 'express';
import Category from '../models/Category.js';
import adminAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        console.error('Fetch categories error:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

// Create category
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name is required' });

        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'Category with this name already exists' });
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Failed to create category' });
    }
});

// Update category
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Failed to update category' });
    }
});

// Delete category
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Failed to delete category' });
    }
});

export default router;
