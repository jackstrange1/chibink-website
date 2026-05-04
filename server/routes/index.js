const express = require('express');
const router = express.Router();

const whitelistRoutes = require('./whitelist');
const walletRoutes = require('./wallet');

// cleaner: no /api here
router.use('/whitelist', whitelistRoutes);
router.use('/wallet', walletRoutes);

module.exports = router;
