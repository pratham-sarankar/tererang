import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    default: 'Tere Rang',
  },
  oldPrice: {
    type: String,
    required: true,
  },
  newPrice: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  additionalImages: {
    type: [String],
    default: [],
  },
  sizes: {
    type: [String],
    default: [],
  },
  heightOptions: {
    type: [String],
    default: [],
  },
  highlights: {
    type: [{
      icon: String,
      text: String,
    }],
    default: [],
  },
  category: {
    type: String,
    default: 'general',
  },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
