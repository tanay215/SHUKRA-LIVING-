import mongoose from 'mongoose';

/**
 * Coupon Schema
 * Stores discount coupons/promo codes with validation rules
 */
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]+$/, 'Coupon code must contain only uppercase letters and numbers'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value must be positive'],
    validate: {
      validator: function(value) {
        if (this.discountType === 'percentage') {
          return value >= 0 && value <= 100;
        }
        return value >= 0;
      },
      message: 'Percentage discount must be between 0 and 100'
    }
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value must be positive']
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
    min: [0, 'Max discount amount must be positive'],
    validate: {
      validator: function(value) {
        // Only applicable for percentage discounts
        if (this.discountType === 'percentage' && value !== null) {
          return value >= 0;
        }
        return true;
      },
      message: 'Max discount amount is only applicable for percentage discounts'
    }
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  usageLimitPerUser: {
    type: Number,
    default: 1, // Default: 1 use per user
    min: [1, 'Usage limit per user must be at least 1']
  },
  applicableCategories: {
    type: [String],
    default: [] // Empty array means all categories
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is not active' };
  }
  
  if (new Date() > this.expiryDate) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' };
  }
  
  return { valid: true };
};

// Method to check if user can use this coupon
couponSchema.methods.canUserUse = function(userUsageCount) {
  if (userUsageCount >= this.usageLimitPerUser) {
    return { valid: false, message: 'You have reached the maximum usage limit for this coupon' };
  }
  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderValue) {
    return { 
      valid: false, 
      message: `Minimum order value of ₹${this.minOrderValue.toLocaleString('en-IN')} is required` 
    };
  }
  
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (orderAmount * this.discountValue) / 100;
    // Apply max discount cap if set
    if (this.maxDiscountAmount !== null && discountAmount > this.maxDiscountAmount) {
      discountAmount = this.maxDiscountAmount;
    }
  } else {
    discountAmount = this.discountValue;
    // For flat discount, ensure it doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }
  }
  
  return {
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    finalAmount: Math.max(0, orderAmount - discountAmount)
  };
};

// Pre-save hook to update updatedAt
couponSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Coupon', couponSchema);

