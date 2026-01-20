import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import orderRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import searchRoutes from './routes/search.js';
import wishlistRoutes from './routes/wishlist.js';
import reviewRoutes from './routes/reviews.js';
import analyticsRoutes from './routes/analytics.js';
import returnRoutes from './routes/returns.js';
import couponRoutes from './routes/coupons.js';
import contactRoutes from './routes/contacts.js';
import { sanitizeInput } from './middleware/validation.js';
import { globalErrorHandler } from './utils/errorHandler.js';
import Product from './models/Product.js';
import Settings from './models/Settings.js';
import emergencyDataRecovery from './services/emergencyDataRecovery.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading from multiple possible locations to be robust
dotenv.config({ path: path.join(__dirname, '../.env') }); // Root .env
dotenv.config({ path: path.join(__dirname, '.env') }); // Server .env
dotenv.config(); // Default logic

const app = express();
const PORT = parseInt(process.env.PORT) || 30011;

const PERMANENT_PRODUCTS = [
  {
    title: "Luxury King Size Wooden Bed",
    description: "A sturdy and elegant king-sized bed featuring premium Sheesham wood headboard with visible grain texture.",
    price: 58990,
    category: "Bedroom",
    images: [{ url: "https://m.media-amazon.com/images/I/71g+jlUUJgL.jpg", alt: "Luxury King Size Wooden Bed" }],
    supplier: { name: "Shukra-Livings Pvt Ltd", brandName: "Shukra-Livings" },
    specifications: { material: "Sheesham Wood", color: "Brown", wood: "Sheesham", finish: "Natural", warranty: "1 Year" },
    stock: 15,
    rating: { average: 0, count: 0 },
    purchasesLastMonth: 8,
    deliveryDays: 7,
    paymentOptions: ["COD", "Card"],
    isActive: true,
    returnPolicy: { isReturnable: true, returnDays: 30, returnConditions: "Product must be in original condition" }
  },
  {
    title: "Premium Leather Sofa Set",
    description: "Comfortable 3-seater leather sofa with premium cushioning and modern design.",
    price: 89990,
    category: "Living",
    images: [{ url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500", alt: "Premium Leather Sofa Set" }],
    supplier: { name: "Shukra-Livings Pvt Ltd", brandName: "Shukra-Livings" },
    specifications: { material: "Genuine Leather", color: "Black", type: "3-Seater", finish: "Premium", warranty: "2 Years" },
    stock: 8,
    rating: { average: 0, count: 0 },
    purchasesLastMonth: 5,
    deliveryDays: 10,
    paymentOptions: ["COD", "Card"],
    isActive: true,
    returnPolicy: { isReturnable: false, returnDays: 0, returnConditions: "" }
  },
  {
    title: "Elegant Dining Table Set",
    description: "6-seater dining table with matching chairs, perfect for family gatherings.",
    price: 45990,
    category: "Dining",
    images: [{ url: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=500", alt: "Elegant Dining Table Set" }],
    supplier: { name: "Shukra-Livings Pvt Ltd", brandName: "Shukra-Livings" },
    specifications: { material: "Solid Wood", color: "Natural", wood: "Teak", finish: "Polished", warranty: "1 Year" },
    stock: 12,
    rating: { average: 0, count: 0 },
    purchasesLastMonth: 12,
    deliveryDays: 14,
    paymentOptions: ["COD", "Card"],
    isActive: true,
    returnPolicy: { isReturnable: true, returnDays: 15, returnConditions: "Assembly required items cannot be returned once assembled" }
  }
];

const restoreData = async () => {
  try {
    const count = await Product.countDocuments({ isActive: true });
    if (count === 0) {
      console.log('🚨 NO PRODUCTS! Restoring...');
      await Product.deleteMany({});
      await Product.insertMany(PERMANENT_PRODUCTS);
      console.log('✅ Restored 3 permanent products');
    }

    for (const perm of PERMANENT_PRODUCTS) {
      const exists = await Product.findOne({ title: perm.title });
      if (!exists) {
        await Product.create(perm);
        console.log(`✅ Restored: ${perm.title}`);
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
        freeDeliveryThreshold: 50000,
        deliveryCharge: 500,
        globalDiscount: 0,
        discountType: 'percentage'
      });
    }
  } catch (error) {
    console.error('❌ Restore error:', error);
  }
};

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many admin login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(limiter);
app.use('/api/admin/login', adminLimiter);

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      // For dev convenience, maybe log it but still block
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10
      });

      console.log('✅ MongoDB Atlas Connected Successfully');
      console.log('🌐 Database: shukra_living');

      await mongoose.connection.db.admin().ping();
      console.log('✅ Database ping successful');

      console.log('🚨 EMERGENCY MODE: Restoring data...');
      await restoreData();
      console.log('✅ Data restoration complete');

      break;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB connection attempt ${retries} failed:`, err.message);

      if (retries >= maxRetries) {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
      }

      console.log(`⏳ Retrying in 5 seconds... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectWithRetry();

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected - attempting reconnection...');
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});

// ==================== PROCESS-LEVEL ERROR HANDLERS ====================
// These handlers prevent the server from crashing on unhandled errors

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED PROMISE REJECTION 💥');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  // Don't exit the process - log and continue
  // In production, you might want to log to a service like Sentry
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION 💥');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  // For uncaught exceptions, it's safer to exit and let a process manager restart
  // But we'll give it a moment to log
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('⏹️ Shutting down gracefully (SIGINT)...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('⏹️ Shutting down gracefully (SIGTERM)...');
  await mongoose.connection.close();
  process.exit(0);
});

app.use(sanitizeInput);

// Emergency data check every 2 minutes
setInterval(async () => {
  try {
    const count = await Product.countDocuments({ isActive: true });
    if (count < 3) {
      console.log(`🔄 Emergency data check: Only ${count} products. Restoring...`);
      await restoreData();
    }
  } catch (error) {
    console.error('❌ Emergency check error:', error);
  }
}, 2 * 60 * 1000);

app.get('/', (req, res) => {
  res.json({
    message: 'Shukra Living API Server',
    status: 'Running',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      admin: '/api/admin'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/contacts', contactRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await restoreData();
    const count = await Product.countDocuments({ isActive: true });

    res.json({
      status: 'OK',
      message: 'Shukra Living API is running (EMERGENCY MODE)',
      database: {
        status: 'healthy',
        products: count,
        mode: 'EMERGENCY_RECOVERY'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

app.post('/api/emergency-restore', async (req, res) => {
  try {
    console.log('🚨 EMERGENCY RESTORE TRIGGERED');
    await Product.deleteMany({});
    await Product.insertMany(PERMANENT_PRODUCTS);

    res.json({
      status: 'OK',
      message: 'Emergency restore completed',
      productsRestored: 3,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Emergency restore failed',
      error: error.message
    });
  }
});

app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('🚨 EMERGENCY MODE ACTIVE - Data recovery enabled');
  console.log('📊 Analytics API available at /api/analytics');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Please stop the other server first.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});
