import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
    },
    slug: {
        type: String,
        trim: true,
        lowercase: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    coverImage: {
        type: String,
        trim: true,
        default: '',
    },
    coverImagePath: {
        type: String,
        trim: true,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

categorySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
    next();
});

export default mongoose.model('Category', categorySchema);
