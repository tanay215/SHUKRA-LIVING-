import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config({ path: '../.env' });

const inspectUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`Checking ${products.length} products...`);

        let badCount = 0;
        for (const product of products) {
            if (product.images && Array.isArray(product.images)) {
                product.images.forEach((img, idx) => {
                    const url = img.url;
                    // Check for HTML entity encoding
                    if (url.includes('&amp;') || url.includes('&#x2F;') || url.includes('&lt;') || url.includes('&gt;') || url.includes('&quot;')) {
                        console.log(`❌ MALFORMED URL in "${product.title}" (Index ${idx}):`);
                        console.log(`   ${url}`);
                        badCount++;
                    }
                    // Check for other common issues
                    else if (!url.startsWith('http') && !url.startsWith('data:')) {
                        console.log(`⚠️ SUSPICIOUS URL in "${product.title}" (Index ${idx}):`);
                        console.log(`   ${url}`);
                    }
                });
            }
        }

        if (badCount === 0) {
            console.log('✅ No obvious HTML entity encoding issues found in image URLs.');
        } else {
            console.log(`❌ Found ${badCount} malformed URLs.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

inspectUrls();
