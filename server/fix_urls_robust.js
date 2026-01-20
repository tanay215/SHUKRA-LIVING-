import mongoose from 'mongoose';
import dotenv from 'dotenv';
import validator from 'validator';
import Product from './models/Product.js';

dotenv.config({ path: '../.env' });

const fixUrlsRobust = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        let fixedTotal = 0;

        for (const product of products) {
            let modified = false;

            if (product.images && Array.isArray(product.images)) {
                product.images = product.images.map((img, idx) => {
                    let text = img.url;
                    let original = text;

                    // Recursive unescape
                    let iterations = 0;
                    while (text && (
                        text.includes('&') ||
                        text.includes('%') // Sometimes URL encoding %2F might be mixed in, but usually it's HTML entities
                    ) && iterations < 10) {
                        let prev = text;
                        // Unescape HTML entities
                        text = validator.unescape(text);

                        // Also manually handle common ones if validator misses them or if they are just not standard
                        // text = text.replace(/&#x2F;/g, '/'); // validator.unescape handles this

                        if (text === prev) break;
                        iterations++;
                    }

                    // Final check: if it still has &#x2F; it might be because validator.unescape didn't catch it?
                    // validator.unescape strictly handles known entities.
                    // Let's do a manual pass for the specific issue we saw.
                    if (text.includes('&#x2F;')) text = text.replace(/&#x2F;/g, '/');
                    if (text.includes('&amp;')) text = text.replace(/&amp;/g, '&');

                    if (text !== original) {
                        console.log(`🔧 Fixed URL for "${product.title}" [${idx}]:`);
                        console.log(`   Old: ${original}`);
                        console.log(`   New: ${text}`);
                        modified = true;
                        return { ...img, url: text };
                    }
                    return img;
                });
            }

            if (modified) {
                await product.save();
                fixedTotal++;
            }
        }

        console.log(`\n🎉 Finished! Fixed ${fixedTotal} products.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixUrlsRobust();
