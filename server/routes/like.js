const express = require('express');
const Like = require('../db/models/like');
const authenticateWallet = require('../middleware/auth');

const router = express.Router();

// Like an NFT
router.post('/', authenticateWallet, async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId } = req.body;

    const walletAddress = req.walletAddress.toLowerCase();

    if (!collectionSlug || !contractAddress || !tokenId) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    const normalizedContract = contractAddress.toLowerCase();

    // Check if this wallet already liked the NFT
    const existingLike = await Like.findOne({
      walletAddress,
      contractAddress: normalizedContract,
      tokenId,
    });

    if (existingLike) {
      return res.status(400).json({
        message: 'NFT already liked',
      });
    }

    // Create like
    await Like.create({
      walletAddress,
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
    });

    // Get total likes
    const likeCount = await Like.countDocuments({
      contractAddress: normalizedContract,
      tokenId,
    });

    res.status(201).json({
      message: 'NFT liked successfully',
      liked: true,
      likeCount,
    });
  } catch (error) {
    console.error('Like error:', error);

    res.status(500).json({
      message: 'Failed to like NFT',
    });
  }
});

// Unlike an NFT
router.delete(
  '/:collectionSlug/:contractAddress/:tokenId',
  authenticateWallet,
  async (req, res) => {
    try {
      const { collectionSlug, contractAddress, tokenId } = req.params;

      const walletAddress = req.walletAddress.toLowerCase();

      const normalizedContract = contractAddress.toLowerCase();

      const deletedLike = await Like.findOneAndDelete({
        walletAddress,
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
      });

      if (!deletedLike) {
        return res.status(404).json({
          message: 'Like not found',
        });
      }

      const likeCount = await Like.countDocuments({
        contractAddress: normalizedContract,
        tokenId,
      });

      res.json({
        message: 'NFT unliked successfully',
        liked: false,
        likeCount,
      });
    } catch (error) {
      console.error('Unlike error:', error);

      res.status(500).json({
        message: 'Failed to unlike NFT',
      });
    }
  }
);
/// Get like status and count for an NFT
router.get('/:collectionSlug/:contractAddress/:tokenId', async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId } = req.params;

    const normalizedContract = contractAddress.toLowerCase();

    // Get total likes
    const likeCount = await Like.countDocuments({
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
    });

    // Get authentication token
    const authHeader = req.headers.authorization;

    let liked = false;

    // Check current wallet's like
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];

        const jwt = require('jsonwebtoken');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const walletAddress = decoded.walletAddress.toLowerCase();

        const existingLike = await Like.findOne({
          walletAddress,
          collectionSlug,
          contractAddress: normalizedContract,
          tokenId,
        });

        liked = !!existingLike;
      } catch {
        // Invalid or expired token
        // Treat as not liked
        liked = false;
      }
    }

    res.json({
      liked,
      likeCount,
    });
  } catch (error) {
    console.error('Get like error:', error);

    res.status(500).json({
      message: 'Failed to get likes',
    });
  }
});
module.exports = router;
