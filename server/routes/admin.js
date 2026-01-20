import express from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import Coupon from '../models/Coupon.js';
import { generateToken } from '../middleware/auth.js';
import { catchAsync, AppError } from '../utils/errorHandler.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    console.log('🔑 Admin login attempt:', { adminId, hasPassword: !!password });

    if (!adminId || !password) {
      return res.status(400).json({ error: 'Admin ID and password are required' });
    }

    const trimmedAdminId = adminId.trim();
    const trimmedPassword = password.trim();
    const expectedId = process.env.ADMIN_ID?.trim();
    const expectedPassword = process.env.ADMIN_PASSWORD?.trim();

    if (trimmedAdminId !== expectedId || trimmedPassword !== expectedPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = generateToken('admin', '24h');

    console.log('✅ Admin login successful');

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: 'admin',
        role: 'admin',
        name: 'Administrator'
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId === 'admin') {
      req.admin = { id: 'admin', role: 'admin' };
      next();
    } else {
      res.status(401).json({ error: 'Admin access required' });
    }
  } catch (error) {
    console.error('Admin auth error:', error.message);
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

router.get('/products', adminAuth, async (req, res) => {
  try {
    console.log('🔍 Admin fetching products...');

    const { default: dataConsistencyService } = await import('../services/dataConsistencyService.js');
    await dataConsistencyService.ensureDataConsistency();

    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`✅ Admin found ${products.length} products`);

    if (products.length === 0) {
      console.log('⚠️ No products found, forcing data restoration...');
      await dataConsistencyService.ensureDataConsistency();
      const restoredProducts = await Product.find().sort({ createdAt: -1 });
      console.log(`🔄 Restored ${restoredProducts.length} products`);
      return res.json(restoredProducts);
    }

    res.json(products);
  } catch (error) {
    console.error('❌ Admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', adminAuth, async (req, res) => {
  try {
    console.log('📦 Creating new product...');

    const productData = {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category || 'Living',
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 10,
      isActive: true
    };

    if (req.body.originalPrice) productData.originalPrice = Number(req.body.originalPrice);
    if (req.body.images && req.body.images[0]?.url) {
      productData.images = [{ url: req.body.images[0].url, alt: req.body.title }];
    }

    if (req.body.supplier) {
      if (typeof req.body.supplier === 'object' && req.body.supplier.name) {
        productData.supplier = {
          name: req.body.supplier.name,
          brandName: req.body.supplier.brandName || req.body.supplier.name,
          productionHouse: req.body.supplier.productionHouse || '',
          location: req.body.supplier.location || '',
          rating: req.body.supplier.rating || 4.5,
          contact: req.body.supplier.contact || ''
        };
      }
    }

    if (req.body.specifications) {
      productData.specifications = {
        material: req.body.specifications.material || '',
        dimensions: req.body.specifications.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        weight: req.body.specifications.weight || 0,
        color: req.body.specifications.color || '',
        finish: req.body.specifications.finish || '',
        texture: req.body.specifications.texture || '',
        type: req.body.specifications.type || '',
        wood: req.body.specifications.wood || '',
        warranty: req.body.specifications.warranty || ''
      };
    }

    productData.rating = { average: 0, count: 0 };
    productData.purchasesLastMonth = 0;
    productData.deliveryDays = 7;
    productData.paymentOptions = ['COD', 'Card'];

    const product = new Product(productData);
    await product.save();

    console.log('✅ Product created successfully:', product._id);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('❌ Create product error:', error.message);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category || 'Living',
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 10
    };

    if (req.body.originalPrice) updateData.originalPrice = Number(req.body.originalPrice);
    if (req.body.images && req.body.images[0]?.url) {
      updateData.images = req.body.images;
    }

    if (req.body.supplier && typeof req.body.supplier === 'object' && req.body.supplier.name) {
      updateData.supplier = {
        name: req.body.supplier.name,
        brandName: req.body.supplier.brandName || req.body.supplier.name,
        productionHouse: req.body.supplier.productionHouse || '',
        location: req.body.supplier.location || '',
        rating: req.body.supplier.rating || 4.5,
        contact: req.body.supplier.contact || ''
      };
    }

    if (req.body.specifications) {
      updateData.specifications = {
        material: req.body.specifications.material || '',
        dimensions: req.body.specifications.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        weight: req.body.specifications.weight || 0,
        color: req.body.specifications.color || '',
        finish: req.body.specifications.finish || '',
        texture: req.body.specifications.texture || '',
        type: req.body.specifications.type || '',
        wood: req.body.specifications.wood || '',
        warranty: req.body.specifications.warranty || ''
      };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { default: dataConsistencyService } = await import('../services/dataConsistencyService.js');
    await dataConsistencyService.ensureDataConsistency();

    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingReturns = await Order.countDocuments({ 'returnRequest.isRequested': true, 'returnRequest.status': 'pending' });
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName');

    res.json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        pendingReturns
      },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone userId createdAt')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { orderStatus, estimatedDelivery } = req.body;

    const currentOrder = await Order.findById(req.params.id);

    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let updateData = {};

    if (orderStatus) {
      updateData.orderStatus = orderStatus;

      if (orderStatus === 'Cancelled') {
        if (currentOrder.paymentStatus === 'Paid') {
          updateData.paymentStatus = 'Refunded';
        }

        for (const item of currentOrder.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        }
      }

      if (orderStatus === 'Delivered' && (currentOrder.paymentMethod === 'COD' || currentOrder.paymentMethod === 'cod')) {
        if (currentOrder.paymentStatus === 'Pending') {
          updateData.paymentStatus = 'Paid';
        }
        updateData.deliveredAt = new Date();
      }
    }

    if (estimatedDelivery) {
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone userId')
      .populate('items.product');

    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

router.delete('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

router.get('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (req.body.freeDeliveryThreshold !== undefined) {
      settings.freeDeliveryThreshold = Math.max(0, Number(req.body.freeDeliveryThreshold));
    }
    if (req.body.deliveryCharge !== undefined) {
      settings.deliveryCharge = Math.max(0, Number(req.body.deliveryCharge));
    }
    if (req.body.globalDiscount !== undefined) {
      settings.globalDiscount = Math.max(0, Number(req.body.globalDiscount));
    }
    if (req.body.discountType) {
      settings.discountType = req.body.discountType;
    }
    if (req.body.philosophy) {
      settings.philosophy = {
        ...settings.philosophy,
        ...req.body.philosophy
      };
    }

    await settings.save();

    console.log('✅ Settings updated');

    res.json({
      message: 'Settings updated successfully',
      settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.post('/restore-products', adminAuth, async (req, res) => {
  try {
    console.log('🌱 Restoring products...');

    const { default: dataConsistencyService } = await import('../services/dataConsistencyService.js');
    const result = await dataConsistencyService.ensureDataConsistency();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

    res.json({
      message: 'Products restored successfully',
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ Restore products error:', error);
    res.status(500).json({ error: 'Failed to restore products' });
  }
});

// Update product return policy
router.put('/products/:id/return-policy', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isReturnable, returnDays, returnConditions } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.returnPolicy = {
      isReturnable: Boolean(isReturnable),
      returnDays: isReturnable ? Math.max(0, Math.min(365, parseInt(returnDays) || 0)) : 0,
      returnConditions: returnConditions || ''
    };

    await product.save();

    res.json({
      message: 'Return policy updated successfully',
      returnPolicy: product.returnPolicy
    });
  } catch (error) {
    console.error('Update return policy error:', error);
    res.status(500).json({ error: 'Failed to update return policy' });
  }
});

// Get all return requests
router.get('/returns', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({ 'returnRequest.isRequested': true })
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'title images price')
      .sort({ 'returnRequest.requestedAt': -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ error: 'Failed to get return requests' });
  }
});

// Update return request status
router.put('/returns/:orderId', adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, scheduledPickupDate, refundAmount, adminNotes } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.returnRequest.status = status;
    if (adminNotes) order.returnRequest.adminNotes = adminNotes;

    if (status === 'approved' && scheduledPickupDate) {
      order.returnRequest.scheduledPickupDate = new Date(scheduledPickupDate);
      console.log('Setting pickup date:', scheduledPickupDate, 'as Date:', new Date(scheduledPickupDate));
    }

    if (status === 'collected') {
      order.returnRequest.collectedAt = new Date();
    }

    if (status === 'completed') {
      order.returnRequest.refundAmount = refundAmount || order.totalAmount;
      order.returnRequest.refundedAt = new Date();

      // Update inventory
      for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    res.json({
      message: 'Return request updated successfully',
      returnRequest: order.returnRequest
    });
  } catch (error) {
    console.error('Update return request error:', error);
    res.status(500).json({ error: 'Failed to update return request' });
  }
});

// ==================== COUPON MANAGEMENT ROUTES ====================

/**
 * Get all coupons (Admin)
 * GET /api/admin/coupons
 */
router.get('/coupons', adminAuth, catchAsync(async (req, res) => {
  const { active } = req.query;
  const filter = {};

  if (active !== undefined) {
    filter.isActive = active === 'true';
  }

  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
  res.json(coupons);
}));

/**
 * Get single coupon (Admin)
 * GET /api/admin/coupons/:id
 */
router.get('/coupons/:id', adminAuth, catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  res.json(coupon);
}));

/**
 * Create new coupon (Admin)
 * POST /api/admin/coupons
 */
router.post('/coupons', adminAuth, catchAsync(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    usageLimitPerUser,
    isActive
  } = req.body;

  // Validate required fields
  if (!code || !discountType || discountValue === undefined || !expiryDate) {
    throw new AppError('Code, discountType, discountValue, and expiryDate are required', 400);
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existingCoupon) {
    throw new AppError('Coupon code already exists', 400);
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description,
    discountType,
    discountValue: Number(discountValue),
    minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    expiryDate: new Date(expiryDate),
    usageLimit: usageLimit ? Number(usageLimit) : null,
    usageLimitPerUser: usageLimitPerUser ? Number(usageLimitPerUser) : 1,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    coupon
  });
}));

/**
 * Update coupon (Admin)
 * PUT /api/admin/coupons/:id
 */
router.put('/coupons/:id', adminAuth, catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  const {
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    usageLimitPerUser,
    isActive
  } = req.body;

  // Update fields if provided
  if (description !== undefined) coupon.description = description;
  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
  if (minOrderValue !== undefined) coupon.minOrderValue = Number(minOrderValue);
  if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
  if (expiryDate !== undefined) coupon.expiryDate = new Date(expiryDate);
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
  if (usageLimitPerUser !== undefined) coupon.usageLimitPerUser = Number(usageLimitPerUser);
  if (isActive !== undefined) coupon.isActive = Boolean(isActive);

  await coupon.save();

  res.json({
    success: true,
    message: 'Coupon updated successfully',
    coupon
  });
}));

/**
 * Delete coupon (Admin)
 * DELETE /api/admin/coupons/:id
 */
router.delete('/coupons/:id', adminAuth, catchAsync(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  await Coupon.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Coupon deleted successfully'
  });
}));

export default router;
