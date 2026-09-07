const express = require('express');
const ChibiPoints = require('../db/models/chibiPoints');
const authenticateWallet = require('../middleware/auth');

const router = express.Router();

// Get current wallet's Chibi Points
router.get('/', authenticateWallet, async (req, res) => {
  try {
    const walletAddress = req.walletAddress.toLowerCase();

    const userPoints = await ChibiPoints.findOne({
      walletAddress,
    });

    res.json({
      points: userPoints?.points || 0,
    });
  } catch (error) {
    console.error('Get Chibi Points error:', error);

    res.status(500).json({
      message: 'Failed to get Chibi Points',
    });
  }
});

module.exports = router;
