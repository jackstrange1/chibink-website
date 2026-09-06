const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateWallet = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.walletAddress = decoded.walletAddress;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      message: 'Invalid or expired authentication token',
    });
  }
};

module.exports = authenticateWallet;
