const mongoose = require('mongoose');

const walletAuthSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },

    nonce: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WalletAuth', walletAuthSchema);
