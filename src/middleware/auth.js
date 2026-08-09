const AuthService = require('../services/authService');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }
    const token = authHeader.substring(7);
    const user = await AuthService.validateToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Auth error' });
  }
};

module.exports = authenticate;