const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  primaryPhone: {
    type: String,
    required: true
  },

  alternatePhone: {
    type: String,
    required: true
  },

  items: [
    {
      name: {
        type: String,
        required: true
      },

      qty: {
        type: Number,
        required: true
      },

      price: {
        type: Number,
        required: true
      },

      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }
    }
  ],

  // Snapshot of address at the time of order
  address: {

    fullName: {
      type: String,
      required: true
    },

    street: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    postalCode: {
      type: String,
      required: true
    },

    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },

  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'WhatsApp'],
    required: true
  },

  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },

  paidAt: {
    type: Date
  },

  status: {
    type: String,
    required: true,

    enum: [
      'Pending',
      'Processing',
      'Shipped',
      'Delivered'
    ],

    default: 'Pending'
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Order',
  orderSchema
);