const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
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

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);
