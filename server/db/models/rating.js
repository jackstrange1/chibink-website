const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// One wallet can rate an NFT only once
ratingSchema.index(
  {
    walletAddress: 1,
    contractAddress: 1,
    tokenId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Rating', ratingSchema);
