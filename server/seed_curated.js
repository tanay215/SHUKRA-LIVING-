import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
    {
        title: 'Modern Leather Sofa',
        category: 'Living',
        price: 129999,
        images: [{ url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800', alt: 'Modern Leather Sofa' }],
        rating: { average: 4.8, count: 124 },
        stock: 10,
        description: 'A premium modern leather sofa perfect for your living room.',
        specifications: { material: 'Leather', color: 'Brown', type: 'Sofa' },
        supplier: { name: 'Shukra Curated', brandName: 'Shukra' },
        isActive: true, // Important for visibility
        purchasesLastMonth: 0,
        deliveryDays: 7,
        paymentOptions: ["COD", "Card"]
    },
    {
        title: 'Minimalist Dining Table',
        category: 'Dining',
        price: 89999,
        images: [{ url: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=800', alt: 'Minimalist Dining Table' }],
        rating: { average: 4.9, count: 89 },
        stock: 5,
        description: 'A sleek, minimalist dining table that seats 6.',
        specifications: { material: 'Wood', color: 'Natural', type: 'Table' },
        supplier: { name: 'Shukra Curated', brandName: 'Shukra' },
        isActive: true,
        purchasesLastMonth: 0,
        deliveryDays: 7,
        paymentOptions: ["COD", "Card"]
    },
    {
        title: 'King Size Bed Frame',
        category: 'Bedroom',
        price: 159999,
        images: [{ url: 'https://images.unsplash.com/photo-1505693416388-b0346efee539?auto=format&fit=crop&q=80&w=800', alt: 'King Size Bed Frame' }],
        rating: { average: 4.7, count: 215 },
        stock: 8,
        description: 'Sturdy and stylish king size bed frame.',
        specifications: { material: 'Wood', color: 'Dark Wood', type: 'Bed' },
        supplier: { name: 'Shukra Curated', brandName: 'Shukra' },
        isActive: true,
        purchasesLastMonth: 0,
        deliveryDays: 7,
        paymentOptions: ["COD", "Card"]
    },
    {
        title: 'Ergonomic Office Chair',
        category: 'Office',
        price: 45999,
        images: [{ url: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800', alt: 'Ergonomic Office Chair' }],
        rating: { average: 4.6, count: 167 },
        stock: 15,
        description: 'High-comfort ergonomic chair for your home office.',
        specifications: { material: 'Mesh & Plastic', color: 'Black', type: 'Chair' },
        supplier: { name: 'Shukra Curated', brandName: 'Shukra' },
        isActive: true,
        purchasesLastMonth: 0,
        deliveryDays: 7,
        paymentOptions: ["COD", "Card"]
    }
];

async function seed() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        for (const p of products) {
            const existing = await Product.findOne({ title: p.title });
            if (existing) {
                console.log(`Skipping existing: ${p.title}`);
            } else {
                await Product.create(p);
                console.log(`Created: ${p.title}`);
            }
        }

        console.log('Seed completed successfully.');
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

seed();
