const express = require('express');

const router = express.Router();

const whitelistRoutes = require('./whitelist');

const walletRoutes = require('./wallet');

const openseaRoutes = require('./opensea');

const ratingRoutes = require('./rating');

const likeRoutes = require('./like');

const commentRoutes = require('./comment');
const discoveryRoutes = require('./discovery');
const chibiPointsRoutes = require('./chibiPoints');

// cleaner: no /api here

router.use('/whitelist', whitelistRoutes);

router.use('/wallet', walletRoutes);

router.use('/opensea', openseaRoutes);

router.use('/rating', ratingRoutes);

router.use('/like', likeRoutes);

router.use('/comment', commentRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/chibi-points', chibiPointsRoutes);

module.exports = router;
