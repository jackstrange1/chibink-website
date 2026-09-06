const express = require('express');
const crypto = require('crypto');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

const WalletAuth = require('../db/models/walletAuth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Generate a nonce for wallet authentication
router.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        message: 'Wallet address is required',
      });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        message: 'Invalid wallet address',
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const nonce = crypto.randomBytes(32).toString('hex');

    const wallet = await WalletAuth.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      {
        walletAddress: normalizedAddress,
        nonce,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json({
      walletAddress: wallet.walletAddress,
      nonce: wallet.nonce,
    });
  } catch (error) {
    console.error('Nonce error:', error);

    res.status(500).json({
      message: 'Failed to generate nonce',
    });
  }
});

// Verify wallet signature
router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;

    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({
        message: 'Wallet address, signature and nonce are required',
      });
    }

    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        message: 'Invalid wallet address',
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    const wallet = await WalletAuth.findOne({
      walletAddress: normalizedAddress,
    });

    if (!wallet) {
      return res.status(401).json({
        message: 'Wallet authentication not found',
      });
    }

    if (wallet.nonce !== nonce) {
      return res.status(401).json({
        message: 'Invalid or expired nonce',
      });
    }

    const message = `Sign this message to authenticate with Chibink.\n\nNonce: ${nonce}`;

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({
        message: 'Signature verification failed',
      });
    }

    // Create authentication token
    const token = jwt.sign(
      {
        walletAddress: normalizedAddress,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // Generate a new nonce so the old signature cannot be reused
    const newNonce = crypto.randomBytes(32).toString('hex');

    wallet.nonce = newNonce;

    await wallet.save();

    res.json({
      message: 'Wallet verified successfully',
      walletAddress: normalizedAddress,
      token,
    });
  } catch (error) {
    console.error('Signature verification error:', error);

    res.status(500).json({
      message: 'Failed to verify wallet',
    });
  }
});

module.exports = router;
