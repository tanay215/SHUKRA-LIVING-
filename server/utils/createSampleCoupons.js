/**
 * Script to create sample coupon codes for testing
 * Run: node server/utils/createSampleCoupons.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config({ path: '../.env' });

const sampleCoupons = [
  {
    code: 'WELCOME10',
    description: 'Welcome discount - 10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscountAmount: 2000,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    usageLimit: 100,
    usageLimitPerUser: 1,
    isActive: true
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹5000',
    discountType: 'flat',
    discountValue: 500,
    minOrderValue: 5000,
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    usageLimit: 50,
    usageLimitPerUser: 1,
    isActive: true
  },
  {
    code: 'BIG20',
    description: '20% off on orders above ₹10000 (max ₹5000 discount)',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 10000,
    maxDiscountAmount: 5000,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    usageLimit: null, // Unlimited
    usageLimitPerUser: 2,
    isActive: true
  },
  {
    code: 'SAVE15',
    description: '15% off on all orders (no minimum)',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 0,
    expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    usageLimit: 200,
    usageLimitPerUser: 3,
    isActive: true
  },
  {
    code: 'FLAT1000',
    description: 'Flat ₹1000 off on orders above ₹20000',
    discountType: 'flat',
    discountValue: 1000,
    minOrderValue: 20000,
    expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
    usageLimit: 25,
    usageLimitPerUser: 1,
    isActive: true
  }
];

const createSampleCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing sample coupons (optional - comment out if you want to keep existing ones)
    // await Coupon.deleteMany({ code: { $in: sampleCoupons.map(c => c.code) } });

    const createdCoupons = [];
    const errors = [];

    for (const couponData of sampleCoupons) {
      try {
        // Check if coupon already exists
        const existing = await Coupon.findOne({ code: couponData.code });
        if (existing) {
          console.log(`⚠️  Coupon ${couponData.code} already exists, skipping...`);
          continue;
        }

        const coupon = await Coupon.create(couponData);
        createdCoupons.push(coupon);
        console.log(`✅ Created coupon: ${coupon.code}`);
      } catch (error) {
        console.error(`❌ Error creating coupon ${couponData.code}:`, error.message);
        errors.push({ code: couponData.code, error: error.message });
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Created: ${createdCoupons.length} coupons`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (createdCoupons.length > 0) {
      console.log('\n📋 Created Coupons:');
      createdCoupons.forEach(c => {
        console.log(`  - ${c.code}: ${c.discountValue}${c.discountType === 'percentage' ? '%' : '₹'} off (Min: ₹${c.minOrderValue})`);
      });
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(e => {
        console.log(`  - ${e.code}: ${e.error}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

createSampleCoupons();

