import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Real furniture products for Shukra Living
const realProducts = [
  {
    title: "Premium Teak Wood Dining Table",
    description: "Handcrafted solid teak wood dining table with natural finish. Seats 6 people comfortably. Perfect for family gatherings and formal dining.",
    price: 85000,
    originalPrice: 95000,
    category: "Dining",
    subcategory: "Tables",
    images: [{ 
      url: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80", 
      alt: "Premium Teak Wood Dining Table" 
    }],
    specifications: {
      material: "Solid Teak Wood",
      dimensions: { length: 180, width: 90, height: 75, unit: "cm" },
      weight: 45,
      color: "Natural Teak",
      finish: "Natural Oil Finish",
      wood: "Teak Wood",
      warranty: "5 Years"
    },
    supplier: {
      name: "Karnataka Furniture Mills",
      brandName: "Heritage Collection",
      location: "Bangalore, Karnataka"
    },
    stock: 12,
    rating: { average: 0, count: 0 },
    tags: ["dining", "teak", "handcrafted", "natural"],
    deliveryDays: 10,
    paymentOptions: ["COD", "Card"],
    isActive: true
  },
  {
    title: "Luxury Leather Recliner Chair",
    description: "Premium genuine leather recliner with ergonomic design and lumbar support. Perfect for relaxation and comfort.",
    price: 65000,
    originalPrice: 75000,
    category: "Living",
    subcategory: "Chairs",
    images: [{ 
      url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80", 
      alt: "Luxury Leather Recliner Chair" 
    }],
    specifications: {
      material: "Genuine Leather & Steel Frame",
      dimensions: { length: 85, width: 90, height: 105, unit: "cm" },
      weight: 35,
      color: "Rich Brown",
      finish: "Premium Leather",
      warranty: "3 Years"
    },
    supplier: {
      name: "Royal Furniture Works",
      brandName: "Luxury Living",
      location: "Mumbai, Maharashtra"
    },
    stock: 8,
    rating: { average: 0, count: 0 },
    tags: ["recliner", "leather", "luxury", "comfort"],
    deliveryDays: 7,
    paymentOptions: ["COD", "Card"],
    isActive: true
  },
  {
    title: "Sheesham Wood King Size Bed",
    description: "Elegant king size bed crafted from solid sheesham wood with intricate carvings. Includes headboard and side panels.",
    price: 125000,
    originalPrice: 140000,
    category: "Bedroom",
    subcategory: "Beds",
    images: [{ 
      url: "https://images.unsplash.com/photo-1505693416388-b0346ef38604?auto=format&fit=crop&w=800&q=80", 
      alt: "Sheesham Wood King Size Bed" 
    }],
    specifications: {
      material: "Solid Sheesham Wood",
      dimensions: { length: 210, width: 180, height: 120, unit: "cm" },
      weight: 80,
      color: "Natural Wood",
      finish: "Polished",
      wood: "Sheesham Wood",
      warranty: "10 Years"
    },
    supplier: {
      name: "Rajasthan Handicrafts",
      brandName: "Royal Heritage",
      location: "Jodhpur, Rajasthan"
    },
    stock: 5,
    rating: { average: 0, count: 0 },
    tags: ["bed", "sheesham", "king size", "carved"],
    deliveryDays: 14,
    paymentOptions: ["COD", "Card"],
    isActive: true
  },
  {
    title: "Executive Office Desk with Storage",
    description: "Modern executive desk with built-in storage compartments and cable management. Perfect for home office or corporate use.",
    price: 45000,
    originalPrice: 52000,
    category: "Office",
    subcategory: "Desks",
    images: [{ 
      url: "https://images.unsplash.com/photo-1541558869434-2840d308329a?auto=format&fit=crop&w=800&q=80", 
      alt: "Executive Office Desk" 
    }],
    specifications: {
      material: "Engineered Wood & Metal",
      dimensions: { length: 150, width: 75, height: 75, unit: "cm" },
      weight: 40,
      color: "Walnut Brown",
      finish: "Laminated",
      warranty: "2 Years"
    },
    supplier: {
      name: "Modern Office Solutions",
      brandName: "Executive Series",
      location: "Pune, Maharashtra"
    },
    stock: 15,
    rating: { average: 0, count: 0 },
    tags: ["office", "desk", "storage", "modern"],
    deliveryDays: 5,
    paymentOptions: ["COD", "Card"],
    isActive: true
  },
  {
    title: "Handwoven Jute Storage Ottoman",
    description: "Eco-friendly storage ottoman made from handwoven jute with cotton lining. Perfect for storing blankets and magazines.",
    price: 8500,
    originalPrice: 10000,
    category: "Living",
    subcategory: "Storage",
    images: [{ 
      url: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?auto=format&fit=crop&w=800&q=80", 
      alt: "Handwoven Jute Storage Ottoman" 
    }],
    specifications: {
      material: "Jute & Cotton",
      dimensions: { length: 60, width: 40, height: 35, unit: "cm" },
      weight: 5,
      color: "Natural Jute",
      finish: "Handwoven",
      warranty: "1 Year"
    },
    supplier: {
      name: "Eco Craft India",
      brandName: "Natural Living",
      location: "West Bengal"
    },
    stock: 25,
    rating: { average: 0, count: 0 },
    tags: ["ottoman", "jute", "eco-friendly", "storage"],
    deliveryDays: 3,
    paymentOptions: ["COD", "Card"],
    isActive: true
  }
];

async function addRealProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products (optional - remove this line to keep existing products)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');

    // Add real products
    const insertedProducts = await Product.insertMany(realProducts);
    console.log(`Successfully added ${insertedProducts.length} real products to the database`);

    // Display added products
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ₹${product.price.toLocaleString('en-IN')} (${product.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

// Run the script
addRealProducts();