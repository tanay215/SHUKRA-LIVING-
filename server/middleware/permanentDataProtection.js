import Product from '../models/Product.js';

const PERMANENT_PRODUCT_TITLES = [
  "Luxury King Size Wooden Bed",
  "Premium Leather Sofa Set",
  "Elegant Dining Table Set"
];

export const protectPermanentProducts = async (req, res, next) => {
  try {
    if (req.method === 'DELETE' && req.path.includes('/products/')) {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      
      if (product && PERMANENT_PRODUCT_TITLES.includes(product.title)) {
        return res.status(403).json({ 
          error: 'Cannot delete permanent products. Use soft delete (mark as inactive) instead.' 
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Permanent data protection error:', error);
    next();
  }
};

export const restorePermanentProducts = async () => {
  try {
    console.log('🛡️ Checking permanent products...');
    
    const permanentProducts = [
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

    for (const permanentProduct of permanentProducts) {
      const exists = await Product.findOne({ title: permanentProduct.title });
      
      if (!exists) {
        console.log(`🔄 Restoring: ${permanentProduct.title}`);
        await Product.create(permanentProduct);
      } else if (!exists.isActive) {
        console.log(`🔄 Reactivating: ${permanentProduct.title}`);
        await Product.findByIdAndUpdate(exists._id, { isActive: true });
      }
    }
    
    console.log('✅ Permanent products verified');
  } catch (error) {
    console.error('❌ Restore permanent products error:', error);
  }
};
