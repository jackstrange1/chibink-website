const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ['gtd', 'fcfs', 'none'],
      default: 'none',
    },
  },
  { timestamps: true }
);
const Wallet = mongoose.model('wallets', walletSchema);

module.exports = Wallet;
