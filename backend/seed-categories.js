// backend/seed-categories.js
import './config/env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import { storage } from './config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const bucket = storage.bucket();

const uploadAssetToGCS = async (relativeAssetPath, destFilename) => {
    const fullPath = path.join(projectRoot, relativeAssetPath);
    if (!fs.existsSync(fullPath)) {
        console.warn(`Asset not found: ${fullPath}`);
        return {
            publicUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
            path: ''
        };
    }

    try {
        const fileContent = fs.readFileSync(fullPath);
        const destination = `images/${destFilename}`;
        const gcsFile = bucket.file(destination);

        const contentType = fullPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        await gcsFile.save(fileContent, {
            metadata: {
                contentType,
                cacheControl: 'public, max-age=31536000',
            },
        });

        try {
            await gcsFile.makePublic();
        } catch (pubErr) {
            // Ignore if uniform bucket-level access prevents makePublic
        }

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        console.log(`Uploaded ${relativeAssetPath} -> ${publicUrl}`);
        return {
            publicUrl,
            path: destination
        };
    } catch (err) {
        console.warn(`Failed to upload ${relativeAssetPath} to cloud storage:`, err.message);
        return {
            publicUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
            path: ''
        };
    }
};

const DEFAULT_CATEGORIES = [
    {
        title: 'Kurti',
        slug: 'kurti',
        description: 'Fluid silhouettes, modern embroidery, and everyday luxury tailored for you.',
        assetFile: 'src/assets/modern_ethnic_fusion.png',
        destFilename: 'category-kurti-seed.png',
    },
    {
        title: 'Suit',
        slug: 'suit',
        description: 'Fluid layers, rich embroideries, and statement silhouettes made for celebrations.',
        assetFile: 'src/assets/banner_1.jpeg',
        destFilename: 'category-suit-seed.jpeg',
    },
    {
        title: 'Coat',
        slug: 'coat',
        description: 'Structured ethnic wear with warm textures, precise cuts, and graceful movement.',
        assetFile: 'src/assets/traditional_ethnic_wear.png',
        destFilename: 'category-coat-seed.png',
    },
    {
        title: 'Ethnic Wear',
        slug: 'ethnicWear',
        description: 'Soft seasonal layers, heritage details, and comfort-first festive dressing.',
        assetFile: 'src/assets/banner_2.jpeg',
        destFilename: 'category-ethnic-wear-seed.jpeg',
    },
    {
        title: 'Wedding Collection',
        slug: 'wedding',
        description: 'Ceremonial sets, rich craft, and made-to-measure silhouettes for memorable days.',
        assetFile: 'src/assets/traditional_ethnic_wear.png',
        destFilename: 'category-wedding-seed.png',
    },
    {
        title: 'Skirt',
        slug: 'skirt',
        description: 'Trendy skirt collection with graceful flares and contemporary style.',
        assetFile: 'src/assets/modern_ethnic_fusion.png',
        destFilename: 'category-skirt-seed.png',
    },
];

const seedCategories = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        console.log(`Starting category seeding (${DEFAULT_CATEGORIES.length} categories)...`);

        for (const item of DEFAULT_CATEGORIES) {
            console.log(`\nProcessing category: "${item.title}" (${item.slug})...`);

            // Check if category already exists by slug, title, or old name
            const existing = await Category.findOne({
                $or: [
                    { slug: item.slug },
                    { title: new RegExp(`^${item.title}$`, 'i') },
                    { name: new RegExp(`^${item.title}$`, 'i') },
                ]
            });

            // Upload image to Cloud Storage
            const uploadResult = await uploadAssetToGCS(item.assetFile, item.destFilename);

            if (existing) {
                existing.title = item.title;
                existing.name = item.title;
                existing.slug = item.slug;
                existing.description = item.description;
                // Only overwrite image if existing has none or if re-seeding
                if (!existing.coverImage || uploadResult.path) {
                    existing.coverImage = uploadResult.publicUrl;
                    existing.coverImagePath = uploadResult.path;
                }
                await existing.save();
                console.log(`Updated existing category: ${item.title}`);
            } else {
                const newCat = new Category({
                    title: item.title,
                    name: item.title,
                    slug: item.slug,
                    description: item.description,
                    coverImage: uploadResult.publicUrl,
                    coverImagePath: uploadResult.path,
                });
                await newCat.save();
                console.log(`Created new category: ${item.title}`);
            }
        }

        console.log('\nCategory seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding categories:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedCategories();
