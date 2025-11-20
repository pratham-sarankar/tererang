// backend/routes/settingsRoutes.js
import express from 'express';
import Settings from '../models/Settings.js';
import adminAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// Get global settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.status(200).json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update global settings (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    const { globalDiscountPercentage, globalDiscountEnabled } = req.body;

    // Validate discount percentage
    if (globalDiscountPercentage !== undefined) {
      if (typeof globalDiscountPercentage !== 'number' || globalDiscountPercentage < 0 || globalDiscountPercentage > 100) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        globalDiscountPercentage: globalDiscountPercentage || 0,
        globalDiscountEnabled: globalDiscountEnabled || false,
      });
    } else {
      if (globalDiscountPercentage !== undefined) {
        settings.globalDiscountPercentage = globalDiscountPercentage;
      }
      if (globalDiscountEnabled !== undefined) {
        settings.globalDiscountEnabled = globalDiscountEnabled;
      }
      await settings.save();
    }

    res.status(200).json({ 
      message: 'Settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
