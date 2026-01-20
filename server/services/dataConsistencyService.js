import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import DataAudit from '../models/DataAudit.js';
import mongoose from 'mongoose';

class DataConsistencyService {
  constructor() {
    this.PERMANENT_PRODUCTS = [
      {
        title: "Luxury King Size Wooden Bed",
        description: "A sturdy and elegant king-sized bed featuring premium Sheesham wood headboard with visible grain texture.",
        price: 58990,
        category: "Bedroom",
        images: [{ url: "https://m.media-amazon.com/images/I/71g+jlUUJgL.jpg", alt: "Luxury King Size Wooden Bed" }],
        supplier: { name: "Shukra-Livings Pvt Ltd", brandName: "Shukra-Livings" },
        specifications: { material: "Sheesham Wood", color: "Brown", wood: "Sheesham", finish: "Natural", warranty: "1 Year" },
        stock: 15,
        rating: { average: 4.5, count: 23 },
        purchasesLastMonth: 8,
        deliveryDays: 7,
        paymentOptions: ["COD", "Card"],
        isActive: true
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
        rating: { average: 4.7, count: 15 },
        purchasesLastMonth: 5,
        deliveryDays: 10,
        paymentOptions: ["COD", "Card"],
        isActive: true
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
        rating: { average: 4.3, count: 31 },
        purchasesLastMonth: 12,
        deliveryDays: 14,
        paymentOptions: ["COD", "Card"],
        isActive: true
      }
    ];
  }

  async auditLog(action, collection, documentId, changes, status = 'success') {
    try {
      await DataAudit.create({
        action,
        collection,
        documentId,
        changes,
        status,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('❌ Audit log error:', error);
    }
  }

  async ensureDataConsistency() {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('🔄 Starting data consistency check...');

      const productCount = await Product.countDocuments().session(session);
      console.log(`📊 Current product count: ${productCount}`);

      if (productCount === 0) {
        console.log('🚨 No products found! Restoring permanent products...');
        const insertedProducts = await Product.insertMany(this.PERMANENT_PRODUCTS, { session });
        await this.auditLog('RESTORE', 'Product', null, { count: insertedProducts.length }, 'success');
        console.log(`✅ Restored ${insertedProducts.length} permanent products`);
      } else {
        for (const permanentProduct of this.PERMANENT_PRODUCTS) {
          const exists = await Product.findOne({ title: permanentProduct.title }).session(session);
          if (!exists) {
            console.log(`⚠️ Missing product: ${permanentProduct.title}. Restoring...`);
            await Product.create([permanentProduct], { session });
            await this.auditLog('RESTORE', 'Product', null, { title: permanentProduct.title }, 'success');
          }
        }
      }

      const invalidProducts = await Product.find({
        $or: [
          { title: { $exists: false } },
          { price: { $exists: false } },
          { category: { $exists: false } },
          { stock: { $exists: false } },
          { isActive: { $exists: false } }
        ]
      }).session(session);

      if (invalidProducts.length > 0) {
        console.log(`⚠️ Found ${invalidProducts.length} invalid products. Fixing...`);
        for (const product of invalidProducts) {
          if (!product.title) product.title = 'Untitled Product';
          if (!product.price) product.price = 0;
          if (!product.category) product.category = 'Decor';
          if (!product.stock) product.stock = 0;
          if (product.isActive === undefined) product.isActive = true;
          await product.save({ session });
        }
        await this.auditLog('FIX', 'Product', null, { count: invalidProducts.length }, 'success');
      }

      let settings = await Settings.findOne().session(session);
      if (!settings) {
        console.log('⚙️ Creating default settings...');
        settings = new Settings({
          freeDeliveryThreshold: 50000,
          deliveryCharge: 500,
          globalDiscount: 0,
          discountType: 'percentage'
        });
        await settings.save({ session });
        await this.auditLog('CREATE', 'Settings', settings._id, { type: 'default' }, 'success');
      }

      await session.commitTransaction();
      console.log('✅ Data consistency check completed successfully');
      return { status: 'success', message: 'Data consistency verified' };
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Data consistency error:', error);
      await this.auditLog('ERROR', 'DataConsistency', null, { error: error.message }, 'failed');
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getProductsWithConsistencyCheck(filter = {}, options = {}) {
    try {
      const { page = 1, limit = 12, sort = { createdAt: -1 } } = options;

      await this.ensureDataConsistency();

      const skip = (page - 1) * limit;
      const query = { isActive: true, ...filter };

      const products = await Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const validProducts = products.filter(p => 
        p && p.title && p.price !== undefined && p.category && p.stock !== undefined
      );

      if (validProducts.length === 0 && products.length > 0) {
        console.warn('⚠️ Retrieved products failed validation. Restoring...');
        await this.ensureDataConsistency();
        return this.getProductsWithConsistencyCheck(filter, options);
      }

      const total = await Product.countDocuments(query);

      return {
        products: validProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('❌ Get products error:', error);
      throw error;
    }
  }

  async getProductByIdWithConsistencyCheck(productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }

      const product = await Product.findById(productId).lean().exec();

      if (!product) {
        console.warn(`⚠️ Product ${productId} not found`);
        return null;
      }

      if (!product.title || product.price === undefined || !product.category) {
        console.warn(`⚠️ Product ${productId} has invalid data. Restoring...`);
        await this.ensureDataConsistency();
        return this.getProductByIdWithConsistencyCheck(productId);
      }

      return product;
    } catch (error) {
      console.error('❌ Get product error:', error);
      throw error;
    }
  }

  async updateProductWithConsistency(productId, updateData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const product = await Product.findById(productId).session(session);

      if (!product) {
        throw new Error('Product not found');
      }

      const originalData = { ...product.toObject() };
      Object.assign(product, updateData);
      await product.save({ session });

      await this.auditLog('UPDATE', 'Product', productId, {
        original: originalData,
        updated: updateData
      }, 'success');

      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      await this.auditLog('UPDATE', 'Product', productId, { error: error.message }, 'failed');
      throw error;
    } finally {
      session.endSession();
    }
  }

  async healthCheck() {
    try {
      const productCount = await Product.countDocuments({ isActive: true });
      const settingsExist = await Settings.findOne();
      const recentAudits = await DataAudit.find().sort({ timestamp: -1 }).limit(10);

      return {
        status: 'healthy',
        products: productCount,
        settings: !!settingsExist,
        recentAudits: recentAudits.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new DataConsistencyService();
