const mongoose = require('mongoose');

const otpRateLimitSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    lastSentAt: {
      type: Date,
      required: true
    },

    windowStartedAt: {
      type: Date,
      required: true
    },

    sendCount: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'OTPRateLimit',
  otpRateLimitSchema
);