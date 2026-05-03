const express = require('express');
const router = express.Router();
const Wallet = require('../db/models/walletSchema');

// helper: normalize wallet
const normalize = addr => addr.trim().toLowerCase();

// GET /api/wallet/:wallet
router.get('/:wallet', async (req, res) => {
  try {
    const raw = req.params.wallet;
    const input = normalize(raw);

    // ✅ simple + reliable validation (0x + exact 40 chars)
    if (!input.startsWith('0x') || input.length !== 42) {
      return res.status(400).json({
        status: 'error',
        msg: 'Invalid wallet address',
      });
    }

    // 🔍 find wallet
    const walletDoc = await Wallet.findOne({ wallet: input });

    // ❌ not found
    if (!walletDoc) {
      return res.json({
        status: 'none',
        msg: '❌ Not eligible',
      });
    }

    // ✅ found → return based on status
    let message = '';

    switch (walletDoc.status) {
      case 'gtd':
        message = '🎉 Guaranteed WL (GTD)';
        break;
      case 'fcfs':
        message = '⚡ FCFS Access';
        break;
      default:
        message = '❌ Not eligible';
    }

    return res.json({
      status: walletDoc.status,
      msg: message,
    });
  } catch (err) {
    console.error('Wallet check error:', err);

    return res.status(500).json({
      status: 'error',
      msg: 'Server error',
    });
  }
});

module.exports = router;
