const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
    },

    collectionSlug: {
      type: String,
      required: true,
      index: true,
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

// One wallet can like an NFT only once
likeSchema.index(
  {
    walletAddress: 1,
    contractAddress: 1,
    tokenId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Like', likeSchema);
