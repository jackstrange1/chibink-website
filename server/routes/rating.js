const express = require('express');
const Rating = require('../db/models/rating');
const authenticateWallet = require('../middleware/auth');

const router = express.Router();

// Add or update a rating for an NFT
router.post('/', authenticateWallet, async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId, rating } = req.body;

    // Wallet address comes from the verified JWT
    const walletAddress = req.walletAddress;

    // Check required fields
    if (
      !walletAddress ||
      !collectionSlug ||
      !contractAddress ||
      !tokenId ||
      rating === undefined
    ) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const normalizedWallet = walletAddress.toLowerCase();

    const normalizedContract = contractAddress.toLowerCase();

    // Find existing rating from this wallet for this NFT
    const existingRating = await Rating.findOne({
      walletAddress: normalizedWallet,
      contractAddress: normalizedContract,
      tokenId,
    });

    let savedRating;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;

      savedRating = await existingRating.save();
    } else {
      // Create a new rating
      const newRating = new Rating({
        walletAddress: normalizedWallet,
        collectionSlug,
        contractAddress: normalizedContract,
        tokenId,
        rating,
      });

      savedRating = await newRating.save();
    }

    // Get all ratings for this NFT
    const allRatings = await Rating.find({
      collectionSlug,
      contractAddress: normalizedContract,
      tokenId,
    });

    const totalRating = allRatings.reduce((sum, item) => sum + item.rating, 0);

    const ratingCount = allRatings.length;

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    res.status(existingRating ? 200 : 201).json({
      message: existingRating
        ? 'Rating updated successfully'
        : 'Rating added successfully',

      rating: savedRating.rating,

      totalRating,

      ratingCount,

      averageRating,
    });
  } catch (error) {
    console.error('Rating error:', error);

    res.status(500).json({
      message: 'Failed to save rating',
    });
  }
});

// Get rating summary for an NFT
router.get('/:collectionSlug/:contractAddress/:tokenId', async (req, res) => {
  try {
    const { collectionSlug, contractAddress, tokenId } = req.params;

    const ratings = await Rating.find({
      collectionSlug,
      contractAddress: contractAddress.toLowerCase(),
      tokenId,
    });

    if (ratings.length === 0) {
      return res.json({
        totalRating: 0,
        ratingCount: 0,
        averageRating: 0,
      });
    }

    const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);

    const ratingCount = ratings.length;

    const averageRating = totalRating / ratingCount;

    res.json({
      totalRating,
      ratingCount,
      averageRating,
    });
  } catch (error) {
    console.error('Get rating error:', error);

    res.status(500).json({
      message: 'Failed to get rating',
    });
  }
});
// Get the current wallet's rating for an NFT
router.get(
  '/user/:collectionSlug/:contractAddress/:tokenId',
  authenticateWallet,
  async (req, res) => {
    try {
      const { collectionSlug, contractAddress, tokenId } = req.params;

      const walletAddress = req.walletAddress.toLowerCase();

      const rating = await Rating.findOne({
        walletAddress,
        collectionSlug,
        contractAddress: contractAddress.toLowerCase(),
        tokenId,
      });

      res.json({
        userRating: rating ? rating.rating : null,
      });
    } catch (error) {
      console.error('Get user rating error:', error);

      res.status(500).json({
        message: 'Failed to get user rating',
      });
    }
  }
);

module.exports = router;
