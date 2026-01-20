import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Request return for an order
router.post('/request/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.orderStatus !== 'Delivered' && order.orderStatus !== 'Placed' && order.orderStatus !== 'Shipped') {
      return res.status(400).json({ error: 'Only delivered, placed, or shipped orders can be returned' });
    }

    if (order.returnRequest.isRequested) {
      return res.status(400).json({ error: 'Return already requested for this order' });
    }

    // Check if any item is returnable (for testing, allow all items)
    let canReturn = true;
    
    // In production, uncomment this validation:
    /*
    const deliveredDate = new Date(order.deliveredAt || order.createdAt);
    const currentDate = new Date();
    
    for (const item of order.items) {
      if (item.product.returnPolicy && item.product.returnPolicy.isReturnable) {
        const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
        if (daysSinceDelivery <= item.product.returnPolicy.returnDays) {
          canReturn = true;
          break;
        }
      }
    }
    */

    if (!canReturn) {
      return res.status(400).json({ error: 'No items in this order are eligible for return' });
    }

    order.returnRequest = {
      isRequested: true,
      requestedAt: new Date(),
      reason,
      status: 'pending'
    };

    await order.save();

    res.json({ 
      message: 'Return request submitted successfully',
      returnRequest: order.returnRequest
    });
  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ error: 'Failed to submit return request' });
  }
});

// Get return status for an order
router.get('/status/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ returnRequest: order.returnRequest });
  } catch (error) {
    console.error('Get return status error:', error);
    res.status(500).json({ error: 'Failed to get return status' });
  }
});

// Submit rating and feedback for an order
router.post('/rating/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.orderStatus !== 'Delivered' && order.orderStatus !== 'Placed' && order.orderStatus !== 'Shipped') {
      return res.status(400).json({ error: 'Only delivered, placed, or shipped orders can be rated' });
    }

    if (order.rating.isRated) {
      return res.status(400).json({ error: 'Order already rated' });
    }

    order.rating = {
      isRated: true,
      ratedAt: new Date(),
      rating,
      feedback
    };

    await order.save();

    // Update product ratings
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        // Get all ratings for this product from orders with ratings (excluding hidden orders)
        const productOrders = await Order.find({
          'items.product': product._id,
          'rating.isRated': true,
          isHidden: { $ne: true }
        });

        if (productOrders.length > 0) {
          const totalRating = productOrders.reduce((sum, o) => sum + (o.rating?.rating || 0), 0);
          const avgRating = totalRating / productOrders.length;
          
          product.rating.average = Math.round(avgRating * 10) / 10; // Round to 1 decimal
          product.rating.count = productOrders.length;
          
          console.log(`Updated product ${product.title} rating: ${product.rating.average} (${product.rating.count} reviews)`);
          await product.save();
        }
      }
    }

    res.json({ 
      message: 'Rating submitted successfully',
      rating: order.rating
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

export default router;