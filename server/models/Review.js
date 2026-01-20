import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  // For manual testimonials
  customerName: String,
  customerRole: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verified: {
    type: Boolean,
    default: false
  },
  isTestimonial: {
    type: Boolean,
    default: false
  },
  images: [{
    url: String,
    alt: String
  }],
  pros: [{ type: String, maxlength: 200 }],
  cons: [{ type: String, maxlength: 200 }],
  wouldRecommend: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ verified: 1 });

// Compound index to prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, {
  unique: true,
  partialFilterExpression: {
    user: { $type: "objectId" },
    product: { $type: "objectId" }
  }
});

// Methods
reviewSchema.methods.markHelpful = function (userId) {
  if (!this.helpfulBy.includes(userId)) {
    this.helpfulBy.push(userId);
    this.helpful += 1;
  }
};

reviewSchema.methods.unmarkHelpful = function (userId) {
  const index = this.helpfulBy.indexOf(userId);
  if (index > -1) {
    this.helpfulBy.splice(index, 1);
    this.helpful = Math.max(0, this.helpful - 1);
  }
};

export default mongoose.model('Review', reviewSchema);