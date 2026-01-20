import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('orders')
      .populate('wishlist');
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add to wishlist
router.post('/wishlist/:productId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Create order
router.post('/orders', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate tracking number
    const trackingNumber = 'SL' + Date.now().toString().slice(-8);
    
    // Set estimated delivery (7 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    
    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      trackingNumber,
      estimatedDelivery,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Placed'
    });

    await order.save();
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    // Add order to user
    const user = await User.findById(req.user._id);
    user.orders.push(order._id);
    await user.save();

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order,
      trackingNumber 
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Track order
router.get('/orders/:trackingNumber/track', async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber })
      .populate('items.product', 'title images')
      .populate('user', 'firstName lastName email phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// Cancel order
router.put('/orders/:id/cancel', authenticate, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('Order status:', order.orderStatus);
    
    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ error: `Order with status '${order.orderStatus}' cannot be cancelled` });
    }
    
    // Update order status and add cancellation reason
    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }
    
    await order.save();
    
    console.log('✅ Order cancelled:', order._id, 'Reason:', reason);
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get user orders with real-time data
router.get('/orders', authenticate, async (req, res) => {
  try {
    console.log('📦 Loading orders for user:', req.user._id);
    const orders = await Order.find({ 
      user: req.user._id,
      isHidden: { $ne: true }
    })
      .populate({
        path: 'items.product',
        select: 'title images price category returnPolicy rating'
      })
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance

    console.log('✅ Found', orders.length, 'orders for user');
    
    // Add real-time status for each order
    const ordersWithStatus = orders.map(order => ({
      ...order,
      isDeliveryOverdue: order.estimatedDelivery && 
        new Date() > new Date(order.estimatedDelivery) && 
        order.orderStatus !== 'Delivered',
      deliveryCountdown: order.estimatedDelivery ? 
        Math.max(0, new Date(order.estimatedDelivery) - new Date()) : null
    }));
    
    res.json(ordersWithStatus);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Remove order from history (soft delete)
router.delete('/orders/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    console.log('🗑️ Removing order from history:', orderId, 'for user:', userId);
    
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Only allow removal of cancelled or delivered orders
    if (!['Cancelled', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ error: 'Only cancelled or delivered orders can be removed from history' });
    }
    
    // Soft delete - mark as hidden instead of actually deleting
    order.isHidden = true;
    await order.save();
    
    console.log('✅ Order marked as hidden:', orderId);
    res.json({ message: 'Order removed from history successfully' });
  } catch (error) {
    console.error('❌ Remove order error:', error);
    res.status(500).json({ error: 'Failed to remove order from history' });
  }
});

export default router;