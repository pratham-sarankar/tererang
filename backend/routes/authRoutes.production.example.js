// backend/routes/authRoutes.production.example.js
// This is an example of how to use rate limiting in production
// To use this:
// 1. Install express-rate-limit: npm install express-rate-limit
// 2. Replace authRoutes.js with this file
// 3. Rename this file to authRoutes.js

import express from 'express';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateOTP } from '../utils/generateOTP.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/authMiddleware.js';
import { otpLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
// Apply rate limiting to prevent abuse
router.post('/send-otp', otpLimiter, async (req, res) => {
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

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this phone number
    await OTP.deleteMany({ phoneNumber });

    // Save OTP to database
    const newOTP = new OTP({
      phoneNumber,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await newOTP.save();

    // TODO: In production, send OTP via SMS service (Twilio, AWS SNS, etc.)
    // Example with Twilio:
    // await twilioClient.messages.create({
    //   body: `Your Tererang verification code is: ${otp}`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully',
      // Remove OTP from response in production!
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login user
// @access  Public
// Apply rate limiting to prevent brute force attacks
router.post('/verify-otp', authLimiter, async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Find OTP in database
    const otpRecord = await OTP.findOne({ phoneNumber, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired' });
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

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isVerified: user.isVerified,
      },
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
    res.status(200).json({
      user: {
        id: req.user._id,
        phoneNumber: req.user.phoneNumber,
        name: req.user.name,
        isVerified: req.user.isVerified,
      },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
