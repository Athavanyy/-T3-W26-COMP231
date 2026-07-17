const AuthService = require('../services/authService');
const userValidation = require('../validators/userValidator');

class AuthController {
  async register(req, res) {
    try {
      const { error } = userValidation.register.validate(req.body);
      if (error) return res.status(400).json({ success: false, message: error.details[0].message });
      const user = await AuthService.register(req.body);
      res.status(201).json({ success: true, message: 'Registered', user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
      const result = await AuthService.login(email, password);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async getCurrentUser(req, res) {
    try {
      res.status(200).json({ success: true, user: req.user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();