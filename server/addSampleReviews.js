// Script to add sample reviews for testing
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const sampleReviews = [
  // High ratings (3+ stars)
  { rating: 5, feedback: "Excellent quality furniture! Very happy with my purchase. The craftsmanship is outstanding and delivery was prompt." },
  { rating: 4, feedback: "Great product, good value for money. The material quality is impressive and it looks exactly as shown in pictures." },
  { rating: 5, feedback: "Amazing furniture piece! Fits perfectly in my living room. The wood finish is beautiful and very sturdy construction." },
  { rating: 4, feedback: "Very satisfied with this purchase. Good quality and the customer service was helpful throughout the process." },
  { rating: 3, feedback: "Decent product overall. The quality is good but delivery took longer than expected. Still happy with the purchase." },
  
  // Low ratings (2.5 and below)
  { rating: 2, feedback: "Product quality is okay but not as expected from the pictures. The color is slightly different and some minor scratches." },
  { rating: 1, feedback: "Very disappointed with this purchase. Poor quality materials and the assembly was difficult. Would not recommend." },
  { rating: 2, feedback: "Not worth the price. The furniture feels cheap and the finish is not smooth. Expected better quality for this cost." },
  { rating: 1, feedback: "Terrible experience. Product arrived damaged and customer service was unhelpful. Had to return it." },
  { rating: 2, feedback: "Below average quality. The wood seems low grade and there are visible defects. Not satisfied with this purchase." }
];

const addSampleReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find();
    
    // Get some users for reviews
    const users = await User.find().limit(10);
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    for (const product of products) {
      console.log(`Adding reviews for: ${product.title}`);
      
      // Add 10 sample reviews per product
      for (let i = 0; i < sampleReviews.length; i++) {
        const review = sampleReviews[i];
        const user = users[i % users.length];
        
        // Create a fake order with rating
        const order = new Order({
          user: user._id,
          items: [{
            product: product._id,
            quantity: 1,
            price: product.price
          }],
          totalAmount: product.price,
          shippingAddress: {
            firstName: user.firstName,
            lastName: user.lastName,
            street: user.address?.street || 'Sample Address',
            city: user.address?.city || 'Mumbai',
            state: user.address?.state || 'Maharashtra',
            zipCode: user.address?.zipCode || '400001',
            country: 'India',
            phone: user.phone
          },
          paymentMethod: 'Card',
          paymentStatus: 'Paid',
          orderStatus: 'Delivered',
          trackingNumber: `SL${Date.now()}${i}`,
          deliveredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          rating: {
            isRated: true,
            ratedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000), // Random date after delivery
            rating: review.rating,
            feedback: review.feedback
          }
        });
        
        await order.save();
      }
      
      // Recalculate product rating
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
      }
    }
    
    console.log('Sample reviews added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addSampleReviews();