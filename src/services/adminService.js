// src/services/adminService.js
const db = require('../config/database');

class AdminService {
  //USER MANAGEMENT
  static async getAllUsers(filters = {}) {
    let sql = `
      SELECT user_id, full_name, email, role, status, created_at 
      FROM users WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.keyword) {
      sql += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getUserById(userId) {
    const [rows] = await db.query(
      'SELECT user_id, full_name, email, role, status, created_at FROM users WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) throw new Error('User not found');
    return rows[0];
  }

  static async updateUserRole(adminId, userId, newRole) {
    const validRoles = ['STUDENT', 'CLUB_EXECUTIVE', 'ADMIN'];
    if (!validRoles.includes(newRole)) throw new Error('Invalid role');

    const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (user.length === 0) throw new Error('User not found');

    await db.query('UPDATE users SET role = ? WHERE user_id = ?', [newRole, userId]);
    return await this.getUserById(userId);
  }

  static async disableUser(adminId, userId) {
    const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (user.length === 0) throw new Error('User not found');
    if (user[0].status === 'INACTIVE') throw new Error('User is already disabled');

    await db.query('UPDATE users SET status = "INACTIVE" WHERE user_id = ?', [userId]);
    return await this.getUserById(userId);
  }

  static async enableUser(adminId, userId) {
    const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (user.length === 0) throw new Error('User not found');
    if (user[0].status === 'ACTIVE') throw new Error('User is already active');

    await db.query('UPDATE users SET status = "ACTIVE" WHERE user_id = ?', [userId]);
    return await this.getUserById(userId);
  }

  //ACTIVITY MONITORING
  static async getRecentActivities(limit = 100) {
    const [rows] = await db.query(`
      (SELECT 'JOIN_REQUEST' as action_type, jr.request_date as activity_date, u.full_name
       FROM join_requests jr
       JOIN users u ON jr.user_id = u.user_id
       LIMIT ?)
      UNION ALL
      (SELECT 'REGISTRATION' as action_type, er.registered_at as activity_date, u.full_name
       FROM event_registrations er
       JOIN users u ON er.user_id = u.user_id
       LIMIT ?)
    `, [Math.ceil(limit/2), Math.ceil(limit/2)]);
    return rows;
  }

  static async getActivityLogs(filters = {}) {
    return await this.getRecentActivities(100);
  }

  static async getFailedActivities() {
    return [];
  }

  //REPORT GENERATION
  static async generateReport(reportType, filters = {}) {
    switch (reportType) {
      case 'club_activity':
        return await this.getClubActivityReport(filters);
      case 'event_participation':
        return await this.getEventParticipationReport(filters);
      case 'user_engagement':
        return await this.getUserEngagementReport(filters);
      case 'membership_stats':
        return await this.getMembershipStatsReport(filters);
      default:
        throw new Error('Invalid report type');
    }
  }

  static async getClubActivityReport(filters = {}) {
    let sql = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM memberships m WHERE m.club_id = c.club_id AND m.status = "ACTIVE") as member_count,
             (SELECT COUNT(*) FROM events e WHERE e.club_id = c.club_id AND e.status = "PUBLISHED") as event_count,
             (SELECT COUNT(*) FROM join_requests jr WHERE jr.club_id = c.club_id AND jr.request_status = "PENDING") as pending_requests
      FROM clubs c
      WHERE 1=1
    `;
    const params = [];
    if (filters.status) {
      sql += ' AND c.status = ?';
      params.push(filters.status);
    }
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getEventParticipationReport(filters = {}) {
    let sql = `
      SELECT e.*, c.club_name,
             (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.registration_status = "REGISTERED") as participant_count
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.status) {
      sql += ' AND e.status = ?';
      params.push(filters.status);
    }
    if (filters.dateFrom) {
      sql += ' AND e.event_date >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += ' AND e.event_date <= ?';
      params.push(filters.dateTo);
    }
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getUserEngagementReport(filters = {}) {
    let sql = `
      SELECT u.user_id, u.full_name, u.email, u.role, u.status,
             (SELECT COUNT(*) FROM memberships m WHERE m.user_id = u.user_id AND m.status = "ACTIVE") as club_memberships,
             (SELECT COUNT(*) FROM event_registrations er WHERE er.user_id = u.user_id AND er.registration_status = "REGISTERED") as event_registrations,
             (SELECT COUNT(*) FROM join_requests jr WHERE jr.user_id = u.user_id AND jr.request_status = "PENDING") as pending_requests
      FROM users u
      WHERE 1=1
    `;
    const params = [];
    if (filters.role) {
      sql += ' AND u.role = ?';
      params.push(filters.role);
    }
    if (filters.status) {
      sql += ' AND u.status = ?';
      params.push(filters.status);
    }
    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getMembershipStatsReport(filters = {}) {
    const [rows] = await db.query(`
      SELECT c.category, 
             COUNT(DISTINCT c.club_id) as club_count,
             COUNT(DISTINCT m.user_id) as total_members,
             COUNT(DISTINCT jr.user_id) as pending_requests
      FROM clubs c
      LEFT JOIN memberships m ON c.club_id = m.club_id AND m.status = "ACTIVE"
      LEFT JOIN join_requests jr ON c.club_id = jr.club_id AND jr.request_status = "PENDING"
      WHERE c.category IS NOT NULL
      GROUP BY c.category
    `);
    return rows;
  }
}

module.exports = AdminService;