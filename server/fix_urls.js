import mongoose from 'mongoose';
import dotenv from 'dotenv';
import validator from 'validator';
import Product from './models/Product.js';

dotenv.config({ path: '../.env' });

const fixUrls = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        let fixedCount = 0;

        for (const product of products) {
            let modified = false;

            if (product.images && Array.isArray(product.images)) {
                product.images = product.images.map(img => {
                    if (img.url && (img.url.includes('&#x2F;') || img.url.includes('&amp;'))) {
                        const original = img.url;
                        const fixed = validator.unescape(img.url);
                        console.log(`🔧 Fixing URL for "${product.title}":\n  Old: ${original}\n  New: ${fixed}`);
                        modified = true;
                        return { ...img, url: fixed };
                    }
                    return img;
                });
            }

            if (modified) {
                await product.save();
                fixedCount++;
            }
        }

        console.log(`\n🎉 Finished! Fixed ${fixedCount} products with corrupted URLs.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixUrls();
