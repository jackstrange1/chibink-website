const express = require('express');
const jwt = require('jsonwebtoken');

const Like = require('../db/models/like');
const ChibiPoints = require('../db/models/chibiPoints');
const ChibiPointLike = require('../db/models/chibiPointLike');

const authenticateWallet = require('../middleware/auth');

const router = express.Router();

// =====================================================
// LIKE AN NFT
// =====================================================

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

    // -------------------------------------------------
    // Check if currently liked
    // -------------------------------------------------

    const existingLike = await Like.findOne({
      walletAddress,
      contractAddress: normalizedContract,
      tokenId,
    }).lean();

    if (existingLike) {
      return res.status(400).json({
        message: 'NFT already liked',
      });
    }

    // -------------------------------------------------
    // Check if this NFT has already awarded
    // a Chibi Point to this wallet
    // -------------------------------------------------

    const alreadyEarnedPoint = await ChibiPointLike.findOne({
      walletAddress,
      contractAddress: normalizedContract,
      tokenId,
    }).lean();

    if (alreadyEarnedPoint) {
      // Still allow the user to like the NFT,
      // but DO NOT give another point.
      //
      // Create the normal Like only.

      const newLike = await Like.create({
        walletAddress,
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
      });

      const likeCount = await Like.countDocuments({
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
      });

      return res.status(201).json({
        message: 'NFT liked successfully',
        liked: true,
        likeCount,
        points: null,
        pointEarned: false,
      });
    }

    // -------------------------------------------------
    // First-ever like for this NFT
    // -------------------------------------------------

    await Like.create({
      walletAddress,
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
    });

    // -------------------------------------------------
    // Save permanent point history
    // -------------------------------------------------

    try {
      await ChibiPointLike.create({
        walletAddress,
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
      });
    } catch (error) {
      // Another simultaneous request may have
      // created the point history first.

      if (error.code === 11000) {
        const likeCount = await Like.countDocuments({
          collectionSlug,
          contractAddress: normalizedContract,
          tokenId,
        });

        return res.status(201).json({
          message: 'NFT liked successfully',
          liked: true,
          likeCount,
          points: null,
          pointEarned: false,
        });
      }

      throw error;
    }

    // -------------------------------------------------
    // Update points + count likes in parallel
    // -------------------------------------------------

    const [chibiPoints, likeCount] = await Promise.all([
      ChibiPoints.findOneAndUpdate(
        { walletAddress },
        { $inc: { points: 1 } },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      ),

      Like.countDocuments({
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
      }),
    ]);

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      message: 'NFT liked successfully',
      liked: true,
      likeCount,
      points: chibiPoints.points,
      pointEarned: true,
    });
  } catch (error) {
    console.error('Like error:', error);

    return res.status(500).json({
      message: 'Failed to like NFT',
    });
  }
});

// =====================================================
// UNLIKE AN NFT
// =====================================================

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
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
      });

      return res.json({
        message: 'NFT unliked successfully',
        liked: false,
        likeCount,

        // IMPORTANT:
        // Chibi Points are NOT removed.
        pointsChanged: false,
      });
    } catch (error) {
      console.error('Unlike error:', error);

      return res.status(500).json({
        message: 'Failed to unlike NFT',
      });
    }
  }
);

// =====================================================
// GET LIKE STATUS + COUNT
// =====================================================

router.get('/:collectionSlug/:contractAddress/:tokenId', async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId } = req.params;

    const normalizedContract = contractAddress.toLowerCase();

    // -------------------------------------------------
    // Get total likes
    // -------------------------------------------------

    const likeCountPromise = Like.countDocuments({
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
    });

    // -------------------------------------------------
    // Check current wallet
    // -------------------------------------------------

    let liked = false;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const walletAddress = decoded.walletAddress.toLowerCase();

        const existingLike = await Like.findOne({
          walletAddress,
          collectionSlug,
          contractAddress: normalizedContract,
          tokenId,
        }).lean();

        liked = !!existingLike;
      } catch {
        liked = false;
      }
    }

    const likeCount = await likeCountPromise;

    return res.json({
      liked,
      likeCount,
    });
  } catch (error) {
    console.error('Get like error:', error);

    return res.status(500).json({
      message: 'Failed to get likes',
    });
  }
});

module.exports = router;
