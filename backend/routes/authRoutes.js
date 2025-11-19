// backend/routes/authRoutes.js
import express from 'express';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendLoginOtpSMS, verifyLoginOtp } from '../utils/smsService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const serializeAddress = (address) => ({
  id: address._id,
  label: address.label,
  contactName: address.contactName,
  phoneNumber: address.phoneNumber,
  line1: address.line1,
  line2: address.line2,
  landmark: address.landmark,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country,
  isDefault: Boolean(address.isDefault),
});

const serializeUser = (user) => ({
  id: user._id,
  phoneNumber: user.phoneNumber,
  name: user.name,
  email: user.email,
  isVerified: user.isVerified,
  addresses: Array.isArray(user.addresses) ? user.addresses.map(serializeAddress) : [],
});

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format. Please enter a 10-digit number.' });
    }

    const delivery = await sendLoginOtpSMS(phoneNumber);

    res.status(200).json({
      message: 'OTP sent successfully',
      delivery,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login user
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const verification = await verifyLoginOtp(phoneNumber, otp);

    if (!verification.approved) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
        status: verification.status,
      });
    }

    // Find or create user
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = new User({
        phoneNumber,
        name: name || '',
        isVerified: true,
      });
      await user.save();
    } else {
      user.isVerified = true;
      if (name) {
        user.name = name;
      }
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/user
// @desc    Get current user details
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/user', protect, async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.name === 'string') {
      updates.name = req.body.name.trim();
    }
    if (typeof req.body.email === 'string') {
      const email = normalizeEmail(req.body.email);
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No profile changes detected' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email is already associated with another account' });
    }
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

export default router;
