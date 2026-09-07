const mongoose = require('mongoose');

const chibiPointLikeSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
    },

    collectionSlug: {
      type: String,
      required: true,
    },

    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
    },

    tokenId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// A wallet can earn the like point for an NFT only once — permanently.
chibiPointLikeSchema.index(
  {
    walletAddress: 1,
    contractAddress: 1,
    tokenId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('ChibiPointLike', chibiPointLikeSchema);
