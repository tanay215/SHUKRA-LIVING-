import Product from '../models/Product.js';
import Settings from '../models/Settings.js';
import fs from 'fs/promises';
import path from 'path';

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

class EmergencyDataRecovery {
  async forceRestoreAllData() {
    try {
      console.log('🚨 EMERGENCY: Force restoring all data...');

      await Product.deleteMany({});
      console.log('🗑️ Cleared all products');

      const inserted = await Product.insertMany(PERMANENT_PRODUCTS);
      console.log(`✅ Restored ${inserted.length} permanent products`);

      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({
          freeDeliveryThreshold: 50000,
          deliveryCharge: 500,
          globalDiscount: 0,
          discountType: 'percentage'
        });
        await settings.save();
        console.log('✅ Created default settings');
      }

      return { success: true, productsRestored: inserted.length };
    } catch (error) {
      console.error('❌ Emergency restore error:', error);
      throw error;
    }
  }

  async verifyAndRepairData() {
    try {
      console.log('🔧 Verifying and repairing data...');

      const count = await Product.countDocuments();
      console.log(`📊 Current products: ${count}`);

      if (count === 0) {
        console.log('🚨 NO PRODUCTS FOUND! Restoring...');
        return await this.forceRestoreAllData();
      }

      const invalidProducts = await Product.find({
        $or: [
          { title: { $exists: false } },
          { price: { $exists: false } },
          { category: { $exists: false } },
          { stock: { $exists: false } }
        ]
      });

      if (invalidProducts.length > 0) {
        console.log(`⚠️ Found ${invalidProducts.length} invalid products. Removing...`);
        await Product.deleteMany({
          $or: [
            { title: { $exists: false } },
            { price: { $exists: false } },
            { category: { $exists: false } },
            { stock: { $exists: false } }
          ]
        });
      }

      const permanentCount = await Product.countDocuments();
      if (permanentCount < PERMANENT_PRODUCTS.length) {
        console.log('⚠️ Missing permanent products. Restoring...');
        for (const perm of PERMANENT_PRODUCTS) {
          const exists = await Product.findOne({ title: perm.title });
          if (!exists) {
            await Product.create(perm);
            console.log(`✅ Restored: ${perm.title}`);
          }
        }
      }

      console.log('✅ Data verification complete');
      return { success: true, productsCount: await Product.countDocuments() };
    } catch (error) {
      console.error('❌ Verify and repair error:', error);
      throw error;
    }
  }

  async getProductsWithFallback() {
    try {
      let products = await Product.find({ isActive: true }).lean();

      if (!products || products.length === 0) {
        console.log('⚠️ No products found. Restoring from permanent list...');
        await this.forceRestoreAllData();
        products = await Product.find({ isActive: true }).lean();
      }

      return products;
    } catch (error) {
      console.error('❌ Get products error:', error);
      return PERMANENT_PRODUCTS;
    }
  }

  async ensureMinimumData() {
    try {
      const count = await Product.countDocuments();
      
      if (count < 3) {
        console.log(`⚠️ Only ${count} products. Restoring to minimum 3...`);
        await this.forceRestoreAllData();
      }

      return true;
    } catch (error) {
      console.error('❌ Ensure minimum data error:', error);
      return false;
    }
  }
}

export default new EmergencyDataRecovery();
