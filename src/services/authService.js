const { users } = require('./mockData');
const ActivityLog = { create: (data) => console.log('Activity Logged:', data) };

class AuthService {
  static async register(userData) {
    const existing = users.find(u => u.email === userData.email);
    if (existing) throw new Error('User already exists');
    const newUser = { id: users.length + 1, ...userData, isActive: true };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  static async login(email, password, ipAddress) {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    if (!user.isActive) throw new Error('Account disabled');
    if (password !== 'password123') throw new Error('Invalid credentials'); // Mock check
    const { password: _, ...userWithoutPassword } = user;
    return { token: 'mock-jwt-token', user: userWithoutPassword };
  }

  static async validateToken(token) {
    return users[0]; // Return first user as mock authenticated user
  }
}

module.exports = AuthService;