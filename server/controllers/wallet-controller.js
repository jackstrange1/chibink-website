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
    const data = req.body;

    const allowedStatus = ['gtd', 'fcfs', 'none'];

    // =========================
    // ✅ BULK INSERT (ARRAY)
    // =========================
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return res.status(400).json({
          status: 'error',
          msg: 'Empty wallet list',
        });
      }

      const validWallets = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        if (!item.wallet) {
          errors.push(`Index ${i}: Wallet is required`);
          continue;
        }

        const normalizedWallet = normalize(item.wallet);

        if (!isValidWallet(normalizedWallet)) {
          errors.push(`Index ${i}: Invalid wallet`);
          continue;
        }

        if (item.status && !allowedStatus.includes(item.status)) {
          errors.push(`Index ${i}: Invalid status`);
          continue;
        }

        validWallets.push({
          wallet: normalizedWallet,
          status: item.status || 'none',
        });
      }

      if (validWallets.length === 0) {
        return res.status(400).json({
          status: 'error',
          msg: 'No valid wallets to insert',
          errors,
        });
      }

      // 🚀 insert (skip duplicates)
      const inserted = await Wallet.insertMany(validWallets, {
        ordered: false,
      });

      return res.status(201).json({
        status: 'success',
        msg: 'Bulk operation completed',
        insertedCount: inserted.length,
        skippedCount: validWallets.length - inserted.length,
        errors,
      });
    }

    // =========================
    // ✅ SINGLE INSERT
    // =========================
    let { wallet, status } = data;

    if (!wallet) {
      return res.status(400).json({
        status: 'error',
        msg: 'Wallet is required',
      });
    }

    const normalizedWallet = normalize(wallet);

    if (!isValidWallet(normalizedWallet)) {
      return res.status(400).json({
        status: 'error',
        msg: 'Invalid wallet address',
      });
    }

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        status: 'error',
        msg: 'Invalid status value',
      });
    }

    const existing = await Wallet.findOne({ wallet: normalizedWallet });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        msg: 'Wallet already exists',
      });
    }

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

    // 🔥 handle duplicate errors silently in bulk
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'error',
        msg: 'Duplicate wallet detected',
      });
    }

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
