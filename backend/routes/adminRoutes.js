import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        // Find admin
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                adminId: admin._id,
                username: admin.username,
                role: admin.role
            },
            process.env.JWT_SECRET
        );

        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Create first admin (for setup - should be protected in production)
router.post('/create-admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if any admin exists
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.status(400).json({
                message: 'Admin already exists. Use login instead.'
            });
        }

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long'
            });
        }

        // Create admin
        const admin = new Admin({ username, password });
        await admin.save();

        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Create admin error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Username already exists'
            });
        }
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Verify admin token
router.get('/verify', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.adminId).select('-password');
        if (!admin) {
            return res.status(404).json({
                message: 'Admin not found'
            });
        }

        res.json({
            message: 'Token valid',
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

export default router;