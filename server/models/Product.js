import mongoose from 'mongoose';

// Clear any existing model to avoid caching issues
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 10000000
  },
  originalPrice: {
    type: Number,
    min: 0,
    max: 10000000
  },
  category: {
    type: String,
    required: true,
    enum: ['Living', 'Dining', 'Bedroom', 'Office', 'Decor']
  },
  subcategory: {
    type: String,
    maxlength: 100
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      maxlength: 200
    },
    optimized: {
      thumbnail: String,
      medium: String,
      large: String
    }
  }],
  specifications: {
    material: { type: String, maxlength: 100 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, default: 'cm', enum: ['cm', 'inch', 'ft'] }
    },
    weight: { type: Number, min: 0 },
    color: { type: String, maxlength: 50 },
    finish: { type: String, maxlength: 100 },
    texture: { type: String, maxlength: 100 },
    type: { type: String, maxlength: 100 },
    wood: { type: String, maxlength: 100 },
    warranty: { type: String, maxlength: 200 }
  },
  supplier: {
    name: { type: String, maxlength: 100 },
    brandName: { type: String, maxlength: 100 },
    productionHouse: { type: String, maxlength: 100 },
    location: { type: String, maxlength: 200 },
    rating: { type: Number, min: 0, max: 5 },
    contact: { type: String, maxlength: 50 }
  },
  purchasesLastMonth: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 365
  },
  paymentOptions: [{
    type: String,
    enum: ['COD', 'Card'],
    default: ['COD', 'Card']
  }],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 1000 },
    helpful: { type: Number, default: 0, min: 0 },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String, maxlength: 50 }],
  isActive: {
    type: Boolean,
    default: true
  },
  offer: {
    type: String,
    default: null,
    maxlength: 200
  },
  searchKeywords: [{ type: String, maxlength: 100 }],
  viewCount: { type: Number, default: 0, min: 0 },
  lastViewed: Date,
  returnPolicy: {
    isReturnable: { type: Boolean, default: false },
    returnDays: { type: Number, default: 0, min: 0, max: 365 },
    returnConditions: { type: String, maxlength: 500 }
  }
}, {
  timestamps: true
});

// Optimized indexes for search and filtering
productSchema.index({ title: 'text', description: 'text', tags: 'text', searchKeywords: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 });

// Methods for rating calculation
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
};

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);