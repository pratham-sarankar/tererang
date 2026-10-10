// backend/seed-dummy-products.js
import './config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import { storage } from './config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const artifactDir = '/Users/srnk/.gemini/antigravity-ide/brain/f41560f3-6944-4982-97b4-13f5ec2b7e37';
const publicDir = path.join(projectRoot, 'public', 'images', 'products');

const bucket = storage.bucket();

const uploadImageToStorage = async (sourceFilename, destFilename) => {
    const publicDest = path.join(publicDir, destFilename);
    const srcPath = fs.existsSync(publicDest)
        ? publicDest
        : path.join(artifactDir, sourceFilename);
    if (!fs.existsSync(srcPath)) {
        throw new Error(`Source image not found: ${srcPath}`);
    }

    // Also copy to public directory for local development safety
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    if (srcPath !== publicDest) {
        fs.copyFileSync(srcPath, publicDest);
    }

    const fileContent = fs.readFileSync(srcPath);
    const destination = `images/${destFilename}`;
    const gcsFile = bucket.file(destination);

    await gcsFile.save(fileContent, {
        metadata: {
            contentType: 'image/jpeg',
            cacheControl: 'public, max-age=31536000',
        },
    });

    try {
        await gcsFile.makePublic();
    } catch (e) {
        // Uniform bucket-level access might be on; ignore error
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    return { publicUrl, destination };
};

const PRODUCTS_DATA = [
    {
        name: 'Gulabi Noor Chikankari Mul Georgette Kurti Set',
        categorySlug: 'kurti',
        price: 2499,
        sourceImage: 'pink_chikankari_kurti_1791572388169.jpg',
        destFilename: 'prod-chikankari-pink-kurti.jpg',
        description: 'Delicate blush pink georgette kurti adorned with intricate hand-embroidered Lucknowi chikankari motifs, tone-on-tone threadwork, and matching relaxed palazzo trousers.',
        sizeStock: [
            { size: 'XS', quantity: 4 },
            { size: 'S', quantity: 6 },
            { size: 'M', quantity: 8 },
            { size: 'L', quantity: 5 },
            { size: 'XL', quantity: 3 },
            { size: 'XXL', quantity: 2 },
            { size: 'CUSTOM', quantity: 5 },
        ],
    },
    {
        name: 'Kesari Chanderi Silk Zari Straight Kurti Set',
        categorySlug: 'kurti',
        price: 1999,
        sourceImage: 'mustard_silk_kurti_1791572502580.jpg',
        destFilename: 'prod-kesari-chanderi-kurti.jpg',
        description: 'Lustrous marigold mustard Chanderi silk straight kurti featuring exquisite zari embroidery at the yoke, paired with coordinated cigarette pants and matching dupatta.',
        sizeStock: [
            { size: 'XS', quantity: 3 },
            { size: 'S', quantity: 5 },
            { size: 'M', quantity: 7 },
            { size: 'L', quantity: 6 },
            { size: 'XL', quantity: 4 },
            { size: 'CUSTOM', quantity: 3 },
        ],
    },
    {
        name: 'Noor-E-Feroza Mirror-Work Georgette Sharara Suit',
        categorySlug: 'suit',
        price: 3899,
        sourceImage: 'blue_sharara_suit_1791572480951.jpg',
        destFilename: 'prod-noor-feroza-sharara-suit.jpg',
        description: 'Pastel powder blue georgette short kurti and tiered flared sharara ensemble highlighted with authentic mirror work, fine resham embroidery, and scalloped dupatta.',
        sizeStock: [
            { size: 'S', quantity: 4 },
            { size: 'M', quantity: 6 },
            { size: 'L', quantity: 5 },
            { size: 'XL', quantity: 3 },
            { size: 'CUSTOM', quantity: 4 },
        ],
    },
    {
        name: 'Zamrud Pure Silk Kalidar Anarkali Suit Set',
        categorySlug: 'suit',
        price: 4499,
        sourceImage: 'emerald_anarkali_suit_1791572403240.jpg',
        destFilename: 'prod-zamrud-emerald-anarkali.jpg',
        description: 'Royal emerald green pure silk Anarkali suit set tailored with majestic flare, intricate gold zari borders, hand-worked neckline, and sheer embroidered organza dupatta.',
        sizeStock: [
            { size: 'XS', quantity: 2 },
            { size: 'S', quantity: 5 },
            { size: 'M', quantity: 7 },
            { size: 'L', quantity: 4 },
            { size: 'XL', quantity: 3 },
            { size: 'CUSTOM', quantity: 5 },
        ],
    },
    {
        name: 'Surya Chanderi Silk Resham Embroidered Suit Set',
        categorySlug: 'suit',
        price: 3299,
        sourceImage: 'rust_silk_suit_1791572586452.jpg',
        destFilename: 'prod-surya-rust-suit.jpg',
        description: 'Warm rust orange Chanderi silk straight suit accented with intricate floral resham embroidery, straight trousers, and an ethereal cut-work scalloped dupatta.',
        sizeStock: [
            { size: 'S', quantity: 5 },
            { size: 'M', quantity: 6 },
            { size: 'L', quantity: 4 },
            { size: 'XL', quantity: 2 },
            { size: 'XXL', quantity: 2 },
            { size: 'CUSTOM', quantity: 3 },
        ],
    },
    {
        name: 'Shahi Dastkar Velvet Kashmiri Tilla Long Coat Set',
        categorySlug: 'coat',
        price: 4999,
        sourceImage: 'navy_velvet_coat_1791572420899.jpg',
        destFilename: 'prod-shahi-navy-velvet-coat.jpg',
        description: 'Midnight navy blue micro-velvet tailored long ethnic coat featuring Kashmiri tilla gold embroidery over an ivory raw silk inner kurta and straight trousers.',
        sizeStock: [
            { size: 'S', quantity: 3 },
            { size: 'M', quantity: 5 },
            { size: 'L', quantity: 4 },
            { size: 'XL', quantity: 3 },
            { size: 'CUSTOM', quantity: 4 },
        ],
    },
    {
        name: 'Riyasat Imperial Brocade Festive Trench Coat',
        categorySlug: 'coat',
        price: 4599,
        sourceImage: 'wine_brocade_coat_1791572522540.jpg',
        destFilename: 'prod-riyasat-wine-brocade-coat.jpg',
        description: 'Regal wine maroon Banarasi brocade silk long festive coat jacket with high mandarin collar, embossed floral weaves, and structured boutique tailoring.',
        sizeStock: [
            { size: 'XS', quantity: 2 },
            { size: 'S', quantity: 4 },
            { size: 'M', quantity: 6 },
            { size: 'L', quantity: 3 },
            { size: 'XL', quantity: 2 },
            { size: 'CUSTOM', quantity: 3 },
        ],
    },
    {
        name: 'Mayur Teal Banarasi Silk Flared Festive Skirt Set',
        categorySlug: 'skirt',
        price: 3699,
        sourceImage: 'teal_ethnic_skirt_1791572461178.jpg',
        destFilename: 'prod-mayur-teal-skirt-set.jpg',
        description: 'Peacock teal blue pleated flared ethnic maxi skirt with broad golden Banarasi woven border, matching embroidered sweetheart crop top, and dupatta.',
        sizeStock: [
            { size: 'XS', quantity: 3 },
            { size: 'S', quantity: 6 },
            { size: 'M', quantity: 8 },
            { size: 'L', quantity: 5 },
            { size: 'XL', quantity: 2 },
            { size: 'CUSTOM', quantity: 4 },
        ],
    },
    {
        name: 'Rani Gulal Pleated Raw Silk Ethnic Skirt Ensemble',
        categorySlug: 'skirt',
        price: 3499,
        sourceImage: 'magenta_ethnic_skirt_1791572566751.jpg',
        destFilename: 'prod-rani-gulal-skirt-set.jpg',
        description: 'Vibrant magenta pink raw silk tiered festive skirt adorned with gold foil detailing and traditional motifs, accompanied by an intricately embroidered blouse.',
        sizeStock: [
            { size: 'S', quantity: 4 },
            { size: 'M', quantity: 7 },
            { size: 'L', quantity: 4 },
            { size: 'XL', quantity: 3 },
            { size: 'CUSTOM', quantity: 3 },
        ],
    },
    {
        name: 'Surkh Laal Katan Banarasi Silk Saree',
        categorySlug: 'ethnicwear',
        price: 5299,
        sourceImage: 'royal_red_saree_1791572442464.jpg',
        destFilename: 'prod-surkh-laal-banarasi-saree.jpg',
        description: 'Timeless scarlet red pure Banarasi Katan silk saree woven with Kadwa gold zari floral booti work, an ornate ceremonial pallu, and unstitched blouse piece.',
        sizeStock: [
            { size: 'FREE SIZE', quantity: 12 },
            { size: 'CUSTOM', quantity: 5 },
        ],
    },
    {
        name: 'Mumtaz Royal Velvet Zardozi Bridal Lehenga Set',
        categorySlug: 'wedding',
        price: 8999,
        sourceImage: 'royal_maroon_lehenga_1791572368502.jpg',
        destFilename: 'prod-mumtaz-royal-maroon-lehenga.jpg',
        description: 'Masterpiece bridal lehenga set crafted in rich maroon velvet, lavishly embellished with antique gold zardozi peacock motifs, dabka work, and dual net dupattas.',
        sizeStock: [
            { size: 'XS', quantity: 2 },
            { size: 'S', quantity: 4 },
            { size: 'M', quantity: 5 },
            { size: 'L', quantity: 3 },
            { size: 'XL', quantity: 2 },
            { size: 'CUSTOM', quantity: 6 },
        ],
    },
    {
        name: 'Chandni Ethereal Ivory Raw Silk Mirror-Work Lehenga',
        categorySlug: 'wedding',
        price: 7999,
        sourceImage: 'ivory_gold_lehenga_1791572542548.jpg',
        destFilename: 'prod-chandni-ivory-gold-lehenga.jpg',
        description: 'Dreamy champagne ivory raw silk ceremonial lehenga intricately adorned with genuine mirror embroidery, micro-sequins, and a gossamer veil dupatta.',
        sizeStock: [
            { size: 'XS', quantity: 2 },
            { size: 'S', quantity: 3 },
            { size: 'M', quantity: 5 },
            { size: 'L', quantity: 3 },
            { size: 'XL', quantity: 2 },
            { size: 'CUSTOM', quantity: 5 },
        ],
    },
];

const seedDummyProducts = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log('Loading categories...');
        const categories = await Category.find({});
        const categoryMap = new Map();
        for (const cat of categories) {
            categoryMap.set(cat.slug.toLowerCase(), cat._id);
            if (cat.title) categoryMap.set(cat.title.toLowerCase(), cat._id);
            if (cat.name) categoryMap.set(cat.name.toLowerCase(), cat._id);
        }

        console.log(`Starting dummy products seeding (${PRODUCTS_DATA.length} products)...`);

        for (const item of PRODUCTS_DATA) {
            console.log(`\nProcessing: "${item.name}"...`);

            const categoryId = categoryMap.get(item.categorySlug.toLowerCase());
            if (!categoryId) {
                console.warn(`Category not found for slug: ${item.categorySlug}, skipping.`);
                continue;
            }

            console.log(`Uploading image ${item.sourceImage} -> ${item.destFilename}...`);
            const uploadRes = await uploadImageToStorage(item.sourceImage, item.destFilename);
            console.log(`Uploaded URL: ${uploadRes.publicUrl}`);

            // Upsert product by name
            const existing = await Product.findOne({ name: item.name });

            if (existing) {
                existing.price = item.price;
                existing.image = uploadRes.publicUrl;
                existing.images = [uploadRes.destination];
                existing.imageUrls = [uploadRes.publicUrl];
                existing.description = item.description;
                existing.category = categoryId;
                existing.sizeStock = item.sizeStock;
                existing.inStock = true;
                await existing.save();
                console.log(`Updated existing product: ${item.name}`);
            } else {
                const newProduct = new Product({
                    name: item.name,
                    price: item.price,
                    image: uploadRes.publicUrl,
                    images: [uploadRes.destination],
                    imageUrls: [uploadRes.publicUrl],
                    description: item.description,
                    category: categoryId,
                    sizeStock: item.sizeStock,
                    inStock: true,
                });
                await newProduct.save();
                console.log(`Created new product: ${item.name}`);
            }
        }

        const totalProducts = await Product.countDocuments();
        console.log(`\nDummy products seeded successfully! Total products in DB: ${totalProducts}`);
    } catch (error) {
        console.error('Error seeding dummy products:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedDummyProducts();
