import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    // Legacy single image field kept for backward compatibility (primary image)
    image: {
        type: String,
        required: true,
        trim: true
    },
    // New: support multiple images per product
    images: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        default: 'kurti',
        trim: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps and ensure primary image mirrors first images[] item when applicable
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    // If multiple images provided but primary not set, use the first one
    if ((!this.image || this.image.length === 0) && Array.isArray(this.images) && this.images.length > 0) {
        this.image = this.images[0];
    }
    next();
});

export default mongoose.model('Product', productSchema);