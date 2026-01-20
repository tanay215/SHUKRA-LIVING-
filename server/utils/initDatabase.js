import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

// Permanent sample products that will always exist
const PERMANENT_PRODUCTS = [
  {
    title: "Luxury King Size Wooden Bed",
    description: "A sturdy and elegant king-sized bed featuring premium Sheesham wood headboard with visible grain texture. Designed for maximum comfort and durability, its modern structure suits contemporary bedroom interiors. Perfect blend of aesthetics and build quality.",
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
    description: "Comfortable 3-seater leather sofa with premium cushioning and modern design. Features high-quality genuine leather upholstery with excellent durability and comfort.",
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
    description: "6-seater dining table with matching chairs, perfect for family gatherings. Crafted from solid teak wood with beautiful natural grain patterns.",
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
  },
  {
    title: "Executive Office Chair",
    description: "Ergonomic office chair with lumbar support and premium leather finish. Perfect for long working hours with adjustable height and tilt mechanism.",
    price: 25990,
    category: "Office",
    images: [{ url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500", alt: "Executive Office Chair" }],
    supplier: { name: "Shukra-Livings Pvt Ltd", brandName: "Shukra-Livings" },
    specifications: { material: "Leather", color: "Black", type: "Executive", finish: "Premium", warranty: "1 Year" },
    stock: 20,
    rating: { average: 4.4, count: 18 },
    purchasesLastMonth: 7,
    deliveryDays: 5,
    paymentOptions: ["COD", "Card"],
    isActive: true
  },
  {
    title: "Modern Coffee Table",
    description: "Stylish glass-top coffee table with wooden base. Perfect centerpiece for your living room with ample storage space underneath.",
    price: 18990,
    category: "Living",
    images: [{ url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500", alt: "Modern Coffee Table" }],
    supplier: { name: "Shukra-Livings Pvt Ltd", brandName: "Shukra-Livings" },
    specifications: { material: "Glass & Wood", color: "Natural", wood: "Oak", finish: "Glossy", warranty: "6 Months" },
    stock: 25,
    rating: { average: 4.2, count: 12 },
    purchasesLastMonth: 15,
    deliveryDays: 7,
    paymentOptions: ["COD", "Card"],
    isActive: true
  }
];

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Check if products exist
    const productCount = await Product.countDocuments();
    console.log(`📊 Current product count: ${productCount}`);
    
    if (productCount === 0) {
      console.log('📦 Creating permanent products...');
      await Product.insertMany(PERMANENT_PRODUCTS);
      console.log(`✅ Created ${PERMANENT_PRODUCTS.length} permanent products`);
    } else {
      console.log('✅ Products already exist in database');
    }
    
    // Initialize settings
    let settings = await Settings.findOne();
    if (!settings) {
      console.log('⚙️ Creating default settings...');
      settings = new Settings({
        freeDeliveryThreshold: 50000,
        deliveryCharge: 500,
        globalDiscount: 0,
        discountType: 'percentage'
      });
      await settings.save();
      console.log('✅ Default settings created');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
};

export const ensureProductsExist = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🚨 No products found! Recreating...');
      await Product.insertMany(PERMANENT_PRODUCTS);
      console.log(`✅ Recreated ${PERMANENT_PRODUCTS.length} products`);
      return PERMANENT_PRODUCTS.length;
    }
    return productCount;
  } catch (error) {
    console.error('❌ Error ensuring products exist:', error);
    return 0;
  }
};