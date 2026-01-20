import express from 'express';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';

const router = express.Router();

/**
 * Validate and apply coupon code
 * POST /api/coupons/validate
 * Body: { code: string, orderAmount: number }
 */
router.post('/validate', authenticate, catchAsync(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || !orderAmount) {
    throw new AppError('Coupon code and order amount are required', 400);
  }

  if (typeof orderAmount !== 'number' || orderAmount <= 0) {
    throw new AppError('Order amount must be a positive number', 400);
  }

  // Find coupon by code (case-insensitive)
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) {
    throw new AppError('Invalid coupon code', 404);
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

  // Calculate discount
  const discountCalculation = coupon.calculateDiscount(orderAmount);
  if (!discountCalculation.valid) {
    throw new AppError(discountCalculation.message, 400);
  }

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscountAmount: coupon.maxDiscountAmount
    },
    discount: {
      discountAmount: discountCalculation.discountAmount,
      originalAmount: orderAmount,
      finalAmount: discountCalculation.finalAmount
    }
  });
}));

/**
 * Get all active coupons (Public - for display purposes)
 * GET /api/coupons
 */
router.get('/', catchAsync(async (req, res) => {
  // Return only active, non-expired coupons for public viewing
  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gt: new Date() }
  })
    .select('code description discountType discountValue minOrderValue maxDiscountAmount expiryDate')
    .sort({ createdAt: -1 });
  
  res.json(coupons);
}));

/**
 * Get single coupon by code
 * GET /api/coupons/:code
 */
router.get('/:code', authenticate, catchAsync(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
  
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  res.json(coupon);
}));

export default router;

