import mongoose from 'mongoose';

const sizeStockSchema = new mongoose.Schema(
    {
        size: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            min: 0,
            default: 0,
        },
    },
    { _id: false }
);

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
    // Legacy single image field kept for backward compatibility (primary image URL)
    image: {
        type: String,
        required: false, // Not required since we use imageUrls as primary source
        trim: true
    },
    // Store filenames for deletion purposes (internal use only)
    images: {
        type: [String],
        default: []
    },
    // Primary field: Store public URLs for frontend consumption
    imageUrls: {
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
    sizeStock: {
        type: [sizeStockSchema],
        default: [],
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

// Update timestamps and ensure primary image URL mirrors first imageUrls[] item when applicable
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    // If multiple image URLs provided but primary not set, use the first one
    if ((!this.image || this.image.length === 0) && Array.isArray(this.imageUrls) && this.imageUrls.length > 0) {
        this.image = this.imageUrls[0];
    }

    if (Array.isArray(this.sizeStock)) {
        // Normalize duplicates by size by keeping the last provided value
        const seen = new Map();
        this.sizeStock.forEach((entry) => {
            if (!entry || !entry.size) return;
            const normalizedSize = entry.size.trim();
            const quantity = Number.isFinite(entry.quantity) && entry.quantity > 0
                ? Math.floor(entry.quantity)
                : 0;
            seen.set(normalizedSize.toLowerCase(), {
                size: normalizedSize,
                quantity,
            });
        });
        this.sizeStock = Array.from(seen.values());
        this.inStock = this.sizeStock.some((entry) => entry.quantity > 0);
    }
    next();
});

// Transform method to ensure consistent image data for API responses
productSchema.methods.toJSON = function () {
    const obj = this.toObject();

    // Remove internal images field from API responses (only needed for deletion)
    delete obj.images;

    // Ensure imageUrls is populated for frontend consumption
    if (!Array.isArray(obj.imageUrls) || obj.imageUrls.length === 0) {
        if (obj.image) {
            // Fallback: if no imageUrls but image exists, populate imageUrls
            obj.imageUrls = [obj.image];
        }
    }

    // Ensure primary image is set
    if ((!obj.image || obj.image.length === 0) && Array.isArray(obj.imageUrls) && obj.imageUrls.length > 0) {
        obj.image = obj.imageUrls[0];
    }

    return obj;
};

export default mongoose.model('Product', productSchema);