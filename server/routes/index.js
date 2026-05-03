const whitelistRoutes = require('./whitelist');
const wallet = require('./wallet');
const express = require('express');
const router = express.Router();
router.use('/api/whitelist', whitelistRoutes);
router.use('/api/wallet', wallet);

module.exports = router;
