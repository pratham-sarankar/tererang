// backend/models/User.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: 'Home',
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
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^.+@.+\..+$/, 'Please provide a valid email address'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
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
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export { addressSchema };
export default User;
