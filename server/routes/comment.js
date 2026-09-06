const express = require('express');
const Comment = require('../db/models/comment');
const authenticateWallet = require('../middleware/auth');

const router = express.Router();

// Add a comment to an NFT
router.post('/', authenticateWallet, async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId, comment } = req.body;

    const walletAddress = req.walletAddress.toLowerCase();

    if (!collectionSlug || !contractAddress || !tokenId || !comment) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return res.status(400).json({
        message: 'Comment cannot be empty',
      });
    }

    if (trimmedComment.length > 500) {
      return res.status(400).json({
        message: 'Comment cannot exceed 500 characters',
      });
    }

    const normalizedContract = contractAddress.toLowerCase();

    const newComment = await Comment.create({
      walletAddress,
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
      comment: trimmedComment,
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment,
    });
  } catch (error) {
    console.error('Comment error:', error);

    res.status(500).json({
      message: 'Failed to add comment',
    });
  }
});

// Get comments for an NFT
router.get('/:collectionSlug/:contractAddress/:tokenId', async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId } = req.params;

    const normalizedContract = contractAddress.toLowerCase();

    const comments = await Comment.find({
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);

    res.status(500).json({
      message: 'Failed to get comments',
    });
  }
});
router.delete('/:commentId', authenticateWallet, async (req, res) => {
  try {
    const { commentId } = req.params;
    const walletAddress = req.walletAddress.toLowerCase();

    const comment = await Comment.findOne({
      _id: commentId,
      walletAddress,
    });

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found or you are not allowed to delete it',
      });
    }

    await Comment.deleteOne({ _id: commentId });

    res.json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Delete comment error:', error);

    res.status(500).json({
      message: 'Failed to delete comment',
    });
  }
});
module.exports = router;
