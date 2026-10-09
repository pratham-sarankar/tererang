// backend/migrate-categories.js
import './config/env.js';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

export const migrateProductCategories = async () => {
    const db = mongoose.connection.db;
    const productsCol = db.collection('products');
    const categoriesCol = db.collection('categories');

    const categories = await categoriesCol.find({}).toArray();
    if (!categories.length) {
        console.log('[migrate-categories] No categories found in database to migrate against.');
        return;
    }

    const products = await productsCol.find({}).toArray();
    let migratedCount = 0;

    for (const prod of products) {
        // If category is already an ObjectId pointing to an existing category, skip
        if (prod.category instanceof mongoose.Types.ObjectId) {
            const exists = categories.some((c) => String(c._id) === String(prod.category));
            if (exists) continue;
        }

        const catStr = String(prod.category || '').trim().toLowerCase();
        let matchedCat = categories.find((c) => {
            const slug = String(c.slug || '').trim().toLowerCase();
            const title = String(c.title || '').trim().toLowerCase();
            const name = String(c.name || '').trim().toLowerCase();
            return slug === catStr || title === catStr || name === catStr;
        });

        // Fallback to 'kurti' category or first available category
        if (!matchedCat) {
            matchedCat = categories.find((c) => String(c.slug || '').toLowerCase() === 'kurti') || categories[0];
        }

        if (matchedCat) {
            await productsCol.updateOne(
                { _id: prod._id },
                { $set: { category: matchedCat._id } }
            );
            migratedCount++;
            console.log(`[migrate-categories] Linked product "${prod.name}" (_id: ${prod._id}) to Category "${matchedCat.title}" (_id: ${matchedCat._id})`);
        }
    }

    console.log(`[migrate-categories] Migration complete. ${migratedCount} product(s) migrated.`);
};

// If run directly: node migrate-categories.js
const isDirectRun = process.argv[1] && process.argv[1].endsWith('migrate-categories.js');
if (isDirectRun) {
    (async () => {
        try {
            await connectDB();
            await migrateProductCategories();
            process.exit(0);
        } catch (err) {
            console.error('[migrate-categories] Error:', err);
            process.exit(1);
        }
    })();
}
