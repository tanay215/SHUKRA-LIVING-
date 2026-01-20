
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/Review.js';

dotenv.config({ path: '../.env' });

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('reviews');

        // Check existing indexes
        const indexes = await collection.indexes();
        console.log('Existing indexes:', indexes.map(i => i.name));

        const indexName = 'user_1_product_1';
        const indexExists = indexes.find(i => i.name === indexName);

        if (indexExists) {
            console.log(`Dropping index ${indexName}...`);
            await collection.dropIndex(indexName);
            console.log('Index dropped successfully');
        } else {
            console.log('Index not found, nothing to drop');
        }

        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIndexes();
