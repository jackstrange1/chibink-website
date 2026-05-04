const Wallet = require('../db/models/walletSchema');

// helper: normalize wallet
const normalize = addr => addr.trim().toLowerCase();

// helper: validate wallet (same as frontend)
const isValidWallet = value => /^0x[a-f0-9]{40}$/.test(value);

// =======================
// ➕ ADD WALLET
// =======================
module.exports.addWallet = async (req, res) => {
  try {
    let { wallet, status } = req.body;

    if (!wallet) {
      return res.status(400).json({
        status: 'error',
        msg: 'Wallet is required',
      });
    }

    const normalizedWallet = normalize(wallet);

    // ✅ validation (same as frontend)
    if (!isValidWallet(normalizedWallet)) {
      return res.status(400).json({
        status: 'error',
        msg: 'Invalid wallet address',
      });
    }

    // optional: validate status
    const allowedStatus = ['gtd', 'fcfs', 'none'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        status: 'error',
        msg: 'Invalid status value',
      });
    }

    // 🔍 check existing
    const existing = await Wallet.findOne({ wallet: normalizedWallet });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        msg: 'Wallet already exists',
      });
    }

    // ✅ create
    const newWallet = await Wallet.create({
      wallet: normalizedWallet,
      status: status || 'none',
    });

    return res.status(201).json({
      status: 'success',
      msg: 'Wallet added successfully',
      data: newWallet,
    });
  } catch (err) {
    console.error('Add wallet error:', err);

    return res.status(500).json({
      status: 'error',
      msg: 'Server error',
    });
  }
};

// =======================
// 🔍 GET WALLET STATUS
// =======================
module.exports.getWallet = async (req, res) => {
  try {
    const raw = req.params.wallet;
    const input = normalize(raw);

    // ✅ unified validation
    if (!isValidWallet(input)) {
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

    // ✅ response based on status
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
};
