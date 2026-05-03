const express = require('express');
const router = express.Router();
const Wallet = require('../db/models/walletSchema');

// GET /api/wallet/:wallet
router.get('/:wallet', async (req, res) => {
  try {
    const input = req.params.wallet.toLowerCase().trim();

    // validate wallet
    if (!/^0x[a-f0-9]{40}$/.test(input)) {
      return res.status(400).json({
        msg: 'Invalid wallet address',
      });
    }

    const wallet = await Wallet.findOne({ wallet: input });

    if (!wallet) {
      return res.json({
        status: 'none',
        msg: '❌ Not eligible',
      });
    }

    return res.json({
      status: wallet.status,
      msg:
        wallet.status === 'gtd' ? '🎉 Guaranteed WL (GTD)' : '⚡ FCFS Access',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
