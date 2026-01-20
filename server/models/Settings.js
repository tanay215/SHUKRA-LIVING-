import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  freeDeliveryThreshold: {
    type: Number,
    default: 5000
  },
  deliveryCharge: {
    type: Number,
    default: 500
  },
  globalDiscount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  philosophy: {
    title: { type: String, default: 'Our Philosophy' },
    content: { type: String, default: 'At Shukra Living, we believe in the harmony of nature and design.' },
    imageUrl: { type: String, default: '' }
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);