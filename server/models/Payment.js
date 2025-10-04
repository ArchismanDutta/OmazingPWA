const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Payment type
  type: {
    type: String,
    enum: ['subscription', 'course', 'content'],
    required: true
  },
  // Related items
  relatedItem: {
    itemType: {
      type: String,
      enum: ['Course', 'Content', 'Subscription'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedItem.itemType'
    }
  },
  // Payment details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  // Razorpay details
  razorpay: {
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    paymentId: {
      type: String,
      default: null
    },
    signature: {
      type: String,
      default: null
    }
  },
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  // Metadata
  metadata: {
    discountApplied: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      default: null
    },
    paymentMethod: {
      type: String,
      default: null
    },
    userAgent: String,
    ipAddress: String
  },
  // Refund details
  refund: {
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    },
    requestedAt: Date,
    processedAt: Date
  },
  // Timestamps
  completedAt: {
    type: Date,
    default: null
  },
  failedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ type: 1, status: 1 });
paymentSchema.index({ 'razorpay.orderId': 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });
paymentSchema.index({ createdAt: -1 });

// Instance methods
paymentSchema.methods.markAsCompleted = function(paymentId, signature) {
  this.status = 'completed';
  this.razorpay.paymentId = paymentId;
  this.razorpay.signature = signature;
  this.completedAt = Date.now();
  return this.save();
};

paymentSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  this.failedAt = Date.now();
  return this.save();
};

// Static methods
paymentSchema.statics.findUserPayments = function(userId, filters = {}) {
  return this.find({ user: userId, ...filters })
    .populate('relatedItem.itemId')
    .sort({ createdAt: -1 });
};

paymentSchema.statics.findSuccessfulPayments = function(filters = {}) {
  return this.find({ status: 'completed', ...filters })
    .populate('user', 'name email')
    .populate('relatedItem.itemId')
    .sort({ completedAt: -1 });
};

module.exports = mongoose.model('Payment', paymentSchema);
