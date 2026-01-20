import express from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import { generateToken } from '../middleware/auth.js';
import { ensureProductsExist } from '../utils/initDatabase.js';

const router = express.Router();

// Enterprise-level Admin Login with enhanced security
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;
    
    console.log('🔑 Admin login attempt:', { adminId, hasPassword: !!password });
    console.log('🔍 Expected credentials:', { 
      expectedId: process.env.ADMIN_ID, 
      expectedPassword: process.env.ADMIN_PASSWORD?.substring(0, 3) + '***'
    });

    if (!adminId || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Admin ID and password are required' });
    }

    // Trim whitespace and validate
    const trimmedAdminId = adminId.trim();
    const trimmedPassword = password.trim();
    const expectedId = process.env.ADMIN_ID?.trim();
    const expectedPassword = process.env.ADMIN_PASSWORD?.trim();

    if (trimmedAdminId !== expectedId || trimmedPassword !== expectedPassword) {
      console.log('❌ Invalid credentials:', {
        providedId: trimmedAdminId,
        expectedId,
        passwordMatch: trimmedPassword === expectedPassword
      });
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate long-lived admin token (24 hours)
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

// Admin middleware
const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }
    
    // Verify JWT token
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

// Get all products (admin view) - Enterprise level
router.get('/products', adminAuth, async (req, res) => {
  try {
    console.log('🔍 Admin fetching products...');
    
    // Always ensure data exists before fetching
    const { default: dataService } = await import('../services/dataService.js');
    await dataService.ensureDataExists();
    
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`✅ Admin found ${products.length} products`);
    
    // If no products found, force re-initialization
    if (products.length === 0) {
      console.log('⚠️ No products found, forcing data restoration...');
      dataService.isInitialized = false;
      await dataService.ensureDataExists();
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



// Add new product
router.post('/products', adminAuth, async (req, res) => {
  try {
    console.log('📦 Creating new product...');
    console.log('Received product data:', JSON.stringify(req.body, null, 2));
    
    // Create comprehensive product data
    const productData = {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category || 'Living',
      stock: req.body.stock !== undefined ? Number(req.body.stock) : 10
    };
    
    // Add optional fields
    if (req.body.originalPrice) productData.originalPrice = Number(req.body.originalPrice);
    if (req.body.images && req.body.images[0]?.url) {
      productData.images = [{ url: req.body.images[0].url, alt: req.body.title }];
    }
    
    // Handle supplier information properly
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
      } else if (typeof req.body.supplier === 'string') {
        productData.supplier = {
          name: req.body.supplier,
          brandName: req.body.brand || req.body.supplier
        };
      }
    }
    
    // Handle specifications if provided
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
    
    // Set default values for new products
    productData.rating = { average: 0, count: 0 };
    productData.purchasesLastMonth = 0;
    productData.deliveryDays = 7;
    productData.paymentOptions = ['COD', 'Card'];
    productData.isActive = true;
    
    console.log('Complete product data:', JSON.stringify(productData, null, 2));
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product created successfully:', product._id);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('❌ Create product error:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update product
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    console.log('Update product data:', JSON.stringify(req.body, null, 2));
    
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
    
    // Handle supplier object properly
    if (req.body.supplier) {
      if (typeof req.body.supplier === 'object' && req.body.supplier.name) {
        updateData.supplier = {
          name: req.body.supplier.name,
          brandName: req.body.supplier.brandName || req.body.supplier.name,
          productionHouse: req.body.supplier.productionHouse || '',
          location: req.body.supplier.location || '',
          rating: req.body.supplier.rating || 4.5,
          contact: req.body.supplier.contact || ''
        };
      } else if (typeof req.body.supplier === 'string') {
        updateData.supplier = {
          name: req.body.supplier,
          brandName: req.body.supplier
        };
      }
    }
    
    // Handle specifications if provided
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

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName');

    res.json({
      stats: {
        totalProducts,
        totalUsers,
        totalOrders
      },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all orders
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

// Get single order
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

// Update order status
router.put('/orders/:id', adminAuth, async (req, res) => {
  try {
    const { orderStatus, estimatedDelivery } = req.body;
    console.log('Updating order:', req.params.id, 'with data:', { orderStatus, estimatedDelivery });
    
    const currentOrder = await Order.findById(req.params.id);
    
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let updateData = {};
    
    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      
      // Handle cancellation - set payment status to refunded and restore inventory
      if (orderStatus === 'Cancelled') {
        if (currentOrder.paymentStatus === 'Paid') {
          updateData.paymentStatus = 'Refunded';
        }
        
        // Restore inventory for cancelled orders
        for (const item of currentOrder.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        }
      }
      
      // Handle delivery - mark COD orders as paid
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
    
    console.log('Update data:', updateData);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email phone userId')
     .populate('items.product');
    
    console.log('Order updated successfully:', order._id);
    
    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

// Delete order
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

// Get settings
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

// Update settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Update settings with validation
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
    
    await settings.save();
    
    console.log('✅ Settings updated:', {
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      deliveryCharge: settings.deliveryCharge,
      globalDiscount: settings.globalDiscount,
      discountType: settings.discountType
    });
    
    res.json({ 
      message: 'Settings updated successfully - Changes will reflect immediately on user side', 
      settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Seed products route
router.post('/seed-products', adminAuth, async (req, res) => {
  try {
    console.log('🌱 Seeding products...');
    
    // Clear existing products if requested
    if (req.body.clearExisting) {
      await Product.deleteMany({});
      console.log('🗑️ Cleared existing products');
    }
    
    const count = await ensureProductsExist();
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json({ 
      message: 'Products seeded successfully', 
      count: products.length,
      products 
    });
  } catch (error) {
    console.error('❌ Seed products error:', error);
    res.status(500).json({ error: 'Failed to seed products' });
  }
});

export default router;