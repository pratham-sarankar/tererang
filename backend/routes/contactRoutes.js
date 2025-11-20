// backend/routes/contactRoutes.js
import express from 'express';
import { sendContactEmail } from '../utils/emailService.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Send email
        const result = await sendContactEmail({ name, email, message });

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Your message has been sent successfully! We will get back to you soon.'
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.'
            });
        }
    } catch (error) {
        console.error('[contactRoutes] Error sending contact email:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while sending your message. Please try again later.'
        });
    }
});

export default router;
