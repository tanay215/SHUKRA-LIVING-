import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

// Enterprise-level data persistence service
class DataService {
  constructor() {
    this.isInitialized = false;
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

  async ensureDataExists() {
    try {
      // Always check and restore products if missing
      const productCount = await Product.countDocuments();
      console.log(`📊 Current product count: ${productCount}`);
      
      if (productCount === 0) {
        console.log('🔄 No products found, creating permanent products...');
        await Product.insertMany(this.PERMANENT_PRODUCTS);
        console.log(`✅ Created ${this.PERMANENT_PRODUCTS.length} permanent products`);
      } else if (productCount < this.PERMANENT_PRODUCTS.length) {
        // Check if core products exist, restore missing ones
        for (const permanentProduct of this.PERMANENT_PRODUCTS) {
          const exists = await Product.findOne({ title: permanentProduct.title });
          if (!exists) {
            await Product.create(permanentProduct);
            console.log(`✅ Restored missing product: ${permanentProduct.title}`);
          }
        }
      }
      
      // Always ensure settings exist
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
      
      this.isInitialized = true;
      console.log('✅ Data service initialized successfully');
    } catch (error) {
      console.error('❌ Data initialization error:', error);
      // Don't throw error, just log it to prevent app crashes
    }
  }
  
  async healthCheck() {
    try {
      const productCount = await Product.countDocuments();
      const settingsExist = await Settings.findOne();
      
      return {
        status: 'healthy',
        products: productCount,
        settings: !!settingsExist,
        initialized: this.isInitialized
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        initialized: this.isInitialized
      };
    }
  }
}

export default new DataService();