// Script to recalculate product ratings without losing data
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const recalculateRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find();
    
    for (const product of products) {
      // Get all ratings for this product from non-hidden orders
      const productOrders = await Order.find({
        'items.product': product._id,
        'rating.isRated': true,
        isHidden: { $ne: true }
      });

      if (productOrders.length > 0) {
        const totalRating = productOrders.reduce((sum, o) => sum + (o.rating?.rating || 0), 0);
        const avgRating = totalRating / productOrders.length;
        
        product.rating.average = Math.round(avgRating * 10) / 10;
        product.rating.count = productOrders.length;
        
        await product.save();
        console.log(`Updated ${product.title}: ${product.rating.average} (${product.rating.count} reviews)`);
      } else {
        // Only reset to 0 if no ratings exist
        if (product.rating.count > 0) {
          console.log(`No valid ratings found for ${product.title}, keeping existing rating`);
        }
      }
    }
    
    console.log('Rating recalculation complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

recalculateRatings();