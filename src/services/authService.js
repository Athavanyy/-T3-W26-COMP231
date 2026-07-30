const db = require('../config/database');
const jwt = require('jsonwebtoken');

const AdminService = require('./adminService');

class AuthService {
  static async register(userData) {
    const { email, password, fullName, studentId, role } = userData;

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new Error('User with this email already exists');
    }

    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, status) 
       VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [fullName, email, password, role || 'STUDENT']
    );

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(email, password, ipAddress) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      await AdminService.logActivity(null, 'LOGIN_FAILED', { email }, 'failure', ipAddress);
      throw new Error('Invalid credentials');
    }

    const user = rows[0];
    if (user.status === 'INACTIVE' || user.status === 'DISABLED') {
      throw new Error('Account is disabled. Please contact administrator.');
    }

    if (password !== user.password_hash) {
      await AdminService.logActivity(null, 'LOGIN_FAILED', { email }, 'failure', ipAddress);
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    await AdminService.logActivity(user.user_id, 'LOGIN_SUCCESS', { email: user.email }, 'success', ipAddress);

    const { password_hash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  static async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const [rows] = await db.query(
        'SELECT * FROM users WHERE user_id = ? AND status = "ACTIVE"',
        [decoded.id]
      );
      if (rows.length === 0) return null;
      const { password_hash, ...userWithoutPassword } = rows[0];
      userWithoutPassword.id = userWithoutPassword.user_id;
      return userWithoutPassword;
    } catch (error) {
      return null;
    }
  }
}

module.exports = AuthService;