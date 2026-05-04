const express = require('express');
const router = express.Router();

const { addWallet, getWallet } = require('../controllers/wallet-controller');

// ➕ Add wallet
router.post('/add-wallet', addWallet);

// 🔍 Check wallet
router.get('/:wallet', getWallet);

module.exports = router;
