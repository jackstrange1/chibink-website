const express = require('express');
const router = express.Router();
const Wallet = require('../db/models/walletSchema');

// helper: normalize wallet
// helper: normalize wallet
const normalize = addr => addr.trim().toLowerCase();

// GET /api/wallet/:wallet
router.get('/:wallet', async (req, res) => {
  try {
    const raw = req.params.wallet;
    const input = normalize(raw);

    // ✅ FIXED HERE
    if (!/^0x[a-f0-9]{40}$/.test(input)) {
      return res.status(400).json({
        status: 'error',
        msg: 'Invalid wallet address',
      });
    }

    const walletDoc = await Wallet.findOne({ wallet: input });

    if (!walletDoc) {
      return res.json({
        status: 'none',
        msg: '❌ Not eligible',
      });
    }

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
