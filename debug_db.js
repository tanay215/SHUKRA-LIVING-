import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './server/models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const products = await Product.find({});
        console.log(`Total Products in DB: ${products.length}`);

        const categories = {};
        products.forEach(p => {
            // Log useful details for debugging filtering
            if (p.category === 'Living') console.log(`Found Living item: ${p.title} (Cat: ${p.category})`);

            const cat = p.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        console.log('Category Counts:', categories);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkDB();
