// models/Whitelist.js
const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
      unique: true, // 🚀 prevent duplicate wallets
      lowercase: true,
      trim: true,
    },

    tweetLink: {
      type: String,
      required: true,
      trim: true,
    },

    tasks: {
      follow: { type: Boolean, default: false },
      like: { type: Boolean, default: false },
      comment: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

const Whitelist = mongoose.model('Whitelist', whitelistSchema);

module.exports = Whitelist;
