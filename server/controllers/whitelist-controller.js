const Whitelist = require('../db/models/whitelistSchema');

module.exports.walletsonly = async (req, res) => {
  try {
    const wallets = await Whitelist.find({}, { wallet: 1, _id: 0 });

    return res.status(200).json(wallets);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/whitelist
module.exports.whitelistdone = async (req, res) => {
  try {
    const { wallet, tweetLink, tasks } = req.body;

    // ===== BASIC VALIDATION =====
    if (!wallet || !tweetLink) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // ===== NORMALIZE =====
    const normalizedWallet = wallet.toLowerCase().trim();
    const cleanTweetLink = tweetLink.trim();

    // ===== WALLET VALIDATION =====
    const isValidWallet = /^0x[a-f0-9]{40}$/.test(normalizedWallet);

    if (!isValidWallet) {
      return res.status(400).json({
        msg: 'Invalid wallet address',
      });
    }

    // ===== TWEET LINK VALIDATION =====
    const isValidTweetLink = /^https:\/\/x\.com\/.+\/status\/\d+/.test(
      cleanTweetLink
    );

    if (!isValidTweetLink) {
      return res.status(400).json({
        msg: 'Invalid tweet link (must be a valid X post link)',
      });
    }

    // ===== DUPLICATE CHECK =====
    const exists = await Whitelist.findOne({ wallet: normalizedWallet });

    if (exists) {
      return res.status(400).json({
        msg: 'Wallet already submitted',
      });
    }

    // ===== CREATE ENTRY =====
    const newEntry = await Whitelist.create({
      wallet: normalizedWallet,
      tweetLink: cleanTweetLink,
      tasks: tasks || {
        follow: false,
        like: false,
        comment: false,
      },
    });

    return res.status(201).json({
      msg: 'Whitelist submitted successfully',
      data: newEntry,
    });
  } catch (error) {
    console.error('🔥 FULL ERROR:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        msg: 'Wallet already submitted (duplicate)',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(500).json({
      msg: 'Server error',
      error: error.message,
    });
  }
};
