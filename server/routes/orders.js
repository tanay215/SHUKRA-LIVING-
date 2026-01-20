import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { authenticate } from '../middleware/auth.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';

const router = express.Router();

/**
 * Create new order
 * POST /api/orders
 * Body: { items, totalAmount, paymentMethod, shippingAddress, couponCode (optional) }
 */
router.post('/', authenticate, catchAsync(async (req, res) => {
  const { items, totalAmount, paymentMethod, shippingAddress, couponCode } = req.body;
  
  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  if (!totalAmount || totalAmount <= 0) {
    throw new AppError('Invalid total amount', 400);
  }

  let finalAmount = totalAmount;
  let couponData = null;

  // Validate and apply coupon if provided
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
    
    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    // Check if coupon is valid
    const validityCheck = coupon.isValid();
    if (!validityCheck.valid) {
      throw new AppError(validityCheck.message, 400);
    }

    // Check user usage limit
    const userUsageCount = await Order.countDocuments({
      user: req.user.id,
      'coupon.code': coupon.code,
      orderStatus: { $nin: ['Cancelled'] }
    });

    const userUsageCheck = coupon.canUserUse(userUsageCount);
    if (!userUsageCheck.valid) {
      throw new AppError(userUsageCheck.message, 400);
    }

    // Calculate discount (using subtotal before delivery charges)
    const discountCalculation = coupon.calculateDiscount(totalAmount);
    if (!discountCalculation.valid) {
      throw new AppError(discountCalculation.message, 400);
    }

    finalAmount = discountCalculation.finalAmount;
    couponData = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discountCalculation.discountAmount,
      originalAmount: totalAmount
    };

    // Increment coupon usage count
    coupon.usageCount += 1;
    await coupon.save();
  }

  // Generate tracking number
  const trackingNumber = 'SL' + Date.now() + Math.floor(Math.random() * 1000);
  
  // Update product stock (validate stock availability first)
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new AppError(`Product ${item.product} not found`, 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`, 400);
    }
    
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
  }
  
  const order = new Order({
    user: req.user.id,
    items,
    totalAmount: finalAmount,
    coupon: couponData,
    paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Card',
    paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    orderStatus: 'Placed',
    shippingAddress,
    trackingNumber
  });

  await order.save();
  
  // Populate the order with product details
  await order.populate('items.product', 'title images price');
  
  res.status(201).json({ 
    success: true, 
    message: 'Order created successfully',
    order 
  });
}));

/**
 * Process payment (dummy)
 * POST /api/orders/process-payment
 */
router.post('/process-payment', authenticate, catchAsync(async (req, res) => {
  const { orderId, paymentMethod, cardDetails } = req.body;
  
  if (!orderId) {
    throw new AppError('Order ID is required', 400);
  }
  
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update order payment status
  const order = await Order.findByIdAndUpdate(
    orderId,
    { 
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed'
    },
    { new: true }
  );

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  res.json({ 
    success: true, 
    message: 'Payment processed successfully',
    order 
  });
}));

/**
 * Get order status updates
 * GET /api/orders/:orderId/status
 */
router.get('/:orderId/status', authenticate, catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('items.product', 'title images')
    .populate('user', 'firstName lastName');

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Generate status timeline
  const statusTimeline = [
    { status: 'Placed', date: order.createdAt, completed: true },
    { status: 'Confirmed', date: order.paymentStatus === 'Paid' ? order.updatedAt : null, completed: order.paymentStatus === 'Paid' },
    { status: 'Processing', date: null, completed: false },
    { status: 'Shipped', date: null, completed: false },
    { status: 'Delivered', date: order.deliveredAt, completed: !!order.deliveredAt }
  ];

  res.json({ order, statusTimeline });
}));

/**
 * Get user orders
 * GET /api/orders/user
 */
router.get('/user', authenticate, catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'title images price')
    .sort({ createdAt: -1 });
  
  res.json(orders);
}));

/**
 * Track order by tracking number
 * GET /api/orders/track/:trackingNumber
 */
router.get('/track/:trackingNumber', authenticate, catchAsync(async (req, res) => {
  const order = await Order.findOne({ 
    trackingNumber: req.params.trackingNumber,
    user: req.user.id 
  })
    .populate('items.product', 'title images price')
    .populate('user', 'firstName lastName email phone');
  
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  
  res.json(order);
}));

/**
 * Remove order from user history (only for cancelled/delivered orders)
 * DELETE /api/orders/user/:orderId
 */
router.delete('/user/:orderId', authenticate, catchAsync(async (req, res) => {
  const order = await Order.findOne({ 
    _id: req.params.orderId, 
    user: req.user.id 
  });
  
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  
  if (order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered') {
    throw new AppError('Can only remove cancelled or delivered orders', 400);
  }
  
  await Order.findByIdAndDelete(req.params.orderId);
  res.json({ success: true, message: 'Order removed from history' });
}));

export default router;