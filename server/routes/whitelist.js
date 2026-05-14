const express = require('express');
const router = express.Router();

const {
  whitelistdone,
  walletsonly,
} = require('../controllers/whitelist-controller');

router.post('/whitelist-done', whitelistdone);
router.get('/wallets-only', walletsonly);

module.exports = router;
