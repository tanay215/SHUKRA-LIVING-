import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    priceWhenAdded: {
      type: Number,
      required: true
    },
    notifyOnDiscount: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ 'items.addedAt': -1 });

// Methods
wishlistSchema.methods.addItem = function(productId, price) {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.items.push({
      product: productId,
      priceWhenAdded: price,
      addedAt: new Date()
    });
  }
  return this;
};

wishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this;
};

wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

wishlistSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Wishlist', wishlistSchema);