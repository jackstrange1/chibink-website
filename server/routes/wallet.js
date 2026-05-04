const express = require('express');
const router = express.Router();
const Wallet = require('../db/models/walletSchema');
const { isAddress } = require('ethers');

// helper: normalize wallet
const normalize = addr => addr.trim().toLowerCase();

// GET /api/wallet/:wallet
router.get('/:wallet', async (req, res) => {
  try {
    const raw = req.params.wallet?.trim();

    // ✅ validate using ethers (best practice)
    if (!raw || !isAddress(raw)) {
      return res.status(400).json({
        success: false,
        status: 'invalid',
        message: 'Invalid wallet address',
      });
    }

    const wallet = normalize(raw);

    // 🔍 query (lean = faster, no mongoose overhead)
    const walletDoc = await Wallet.findOne({ wallet }).lean();

    // ❌ not found
    if (!walletDoc) {
      return res.status(200).json({
        success: true,
        status: 'none',
        message: '❌ Not eligible',
      });
    }

    // ✅ status mapping
    const statusMap = {
      gtd: '🎉 Guaranteed WL (GTD)',
      fcfs: '⚡ FCFS Access',
    };

    return res.status(200).json({
      success: true,
      status: walletDoc.status,
      message: statusMap[walletDoc.status] || '❌ Not eligible',
    });
  } catch (err) {
    console.error('Wallet check error:', err);

    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Internal server error',
    });
  }
});

module.exports = router;
