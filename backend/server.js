// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Load environment variables
dotenv.config({ path: '.env' });

// Connect to database
connectDB();

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
// CORS: In development allow any localhost origin; in production restrict to FRONTEND_URL
const frontendUrl = process.env.FRONTEND_URL;
const isProd = process.env.NODE_ENV === 'production';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (!isProd) {
      // Allow any localhost:* during development to avoid port mismatch issues
      if (/^https?:\/\/localhost(?::\d+)?$/.test(origin)) return callback(null, true);
    }
    if (frontendUrl && origin === frontendUrl) return callback(null, true);
    return callback(new Error('CORS not allowed from this origin'), false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  console.log("Health check endpoint hit");
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
