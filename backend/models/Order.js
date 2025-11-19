import mongoose from 'mongoose';

const shippingAddressSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            trim: true,
        },
        contactName: {
            type: String,
            trim: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            required: true,
        },
        line1: {
            type: String,
            trim: true,
            required: true,
        },
        line2: {
            type: String,
            trim: true,
        },
        landmark: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
            required: true,
        },
        state: {
            type: String,
            trim: true,
            required: true,
        },
        postalCode: {
            type: String,
            trim: true,
            required: true,
        },
        country: {
            type: String,
            trim: true,
            default: 'India',
        },
    },
    { _id: false }
);

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        size: {
            type: String,
            trim: true,
        },
        height: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        taxAmount: {
            type: Number,
            min: 0,
            default: 0,
        },
        grandTotal: {
            type: Number,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
            default: 'processing',
        },
        paymentMethod: {
            type: String,
            default: 'upi',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'paid',
        },
        paymentReference: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
