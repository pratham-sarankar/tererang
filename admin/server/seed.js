import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();

const sampleProducts = [
  {
    title: "Royal Blue Sharara Suit",
    description: "Elegant royal blue sharara suit with intricate mirror work, soft rayon fabric, and a matching dupatta. Perfect for evening events.",
    brand: "Tere Rang",
    oldPrice: "₹5,999",
    newPrice: "₹4,299",
    image: "https://img.faballey.com/images/Product/XKS21678A/d4.jpg",
    additionalImages: [
      "https://img.faballey.com/images/Product/XKS21678A/d1.jpg",
      "https://img.faballey.com/images/Product/XKS21678A/d2.jpg",
      "https://img.faballey.com/images/Product/XKS21678A/d3.jpg",
      "https://img.faballey.com/images/Product/XKS21678A/d5.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
    heightOptions: ["Up to 5'3''", "5'4''-5'6''", "5'6'' and above"],
    highlights: [
      { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
      { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
      { icon: 'Ruler', text: 'Custom Fitting Available' }
    ],
    category: "sharara"
  },
  {
    title: "Emerald Green Georgette Set",
    description: "Lustrous emerald green sharara set made from lightweight georgette with delicate thread embroidery. Comes with a full-length sleeve kurta.",
    brand: "Tere Rang",
    oldPrice: "₹7,499",
    newPrice: "₹5,850",
    image: "https://img.faballey.com/images/Product/XKS28726A/d4.jpg",
    additionalImages: [
      "https://img.faballey.com/images/Product/XKS28726A/d1.jpg",
      "https://img.faballey.com/images/Product/XKS28726A/d2.jpg",
      "https://img.faballey.com/images/Product/XKS28726A/d3.jpg",
      "https://img.faballey.com/images/Product/XKS28726A/d5.jpg",
    ],
    sizes: ["M", "L", "XL", "XXL"],
    heightOptions: ["5'4''-5'6''", "5'6'' and above"],
    highlights: [
      { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
      { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
      { icon: 'Ruler', text: 'Custom Fitting Available' }
    ],
    category: "suit"
  },
  {
    title: "Pastel Pink Chikankari Sharara",
    description: "Soft pastel pink cotton sharara featuring traditional Lucknowi Chikankari work. Ideal for casual daytime festivities.",
    brand: "Tere Rang",
    oldPrice: "₹4,500",
    newPrice: "₹3,199",
    image: "https://img.faballey.com/images/Product/XKU09308Z/d4.jpg",
    additionalImages: [
      "https://img.faballey.com/images/Product/XKU09308Z/d1.jpg",
      "https://img.faballey.com/images/Product/XKU09308Z/d2.jpg",
      "https://img.faballey.com/images/Product/XKU09308Z/d3.jpg",
      "https://img.faballey.com/images/Product/XKU09308Z/d5.jpg",
    ],
    sizes: ["S", "M", "L"],
    heightOptions: ["Up to 5'3''", "5'4''-5'6''"],
    highlights: [
      { icon: 'Zap', text: 'Ready-to-Ship (2 days)' },
      { icon: 'Gift', text: 'Free Delivery & Gift Wrapping' },
      { icon: 'Ruler', text: 'Custom Fitting Available' }
    ],
    category: "kurti"
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log('Sample products added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
