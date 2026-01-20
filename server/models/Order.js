import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  coupon: {
    code: {
      type: String,
      uppercase: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat']
    },
    discountValue: Number,
    discountAmount: Number,
    originalAmount: Number
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'UPI', 'NetBanking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancellationReason: String,
  cancelledAt: Date,
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'collected', 'completed'],
      default: 'pending'
    },
    scheduledPickupDate: Date,
    collectedAt: Date,
    refundAmount: Number,
    refundedAt: Date,
    adminNotes: String
  },
  rating: {
    isRated: { type: Boolean, default: false },
    ratedAt: Date,
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, maxlength: 1000 },
    adminResponse: String
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', orderSchema);