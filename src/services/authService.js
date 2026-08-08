const db = require('../config/database');
const jwt = require('jsonwebtoken');

class AuthService {
  static async getUserById(userId) {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      throw new Error('User not found');
    }

    const { password_hash, ...userWithoutPassword } = rows[0];
    return userWithoutPassword;
  }

  static async updateUserProfile(userId, profileData) {
    const { fullName, email } = profileData;
    const updates = [];
    const values = [];

    if (fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(fullName);
    }

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }

    if (updates.length === 0) {
      throw new Error('No profile changes supplied');
    }

    values.push(userId);
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    return this.getUserById(userId);
  }

  static async register(userData) {
    const { email, password, fullName, role } = userData;

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
      throw new Error('Invalid credentials');
    }

    const user = rows[0];
    if (user.status === 'INACTIVE' || user.status === 'DISABLED') {
      throw new Error('Account is disabled. Please contact administrator.');
    }

    if (password !== user.password_hash) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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