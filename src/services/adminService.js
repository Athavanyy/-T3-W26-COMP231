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
  // ===== ACTIVITY LOGGING =====

  static async getRecentActivities(limit = 100) {
    const [rows] = await db.query(`
    SELECT al.*, u.full_name, u.email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    ORDER BY al.created_at DESC
    LIMIT ?
  `, [parseInt(limit)]);
    return rows;
  }

  static async getActivityLogs(filters = {}) {
    let sql = `
    SELECT al.*, u.full_name, u.email
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    WHERE 1=1
  `;
    const params = [];

    if (filters.userId) {
      sql += ' AND al.user_id = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      sql += ' AND al.action LIKE ?';
      params.push(`%${filters.action}%`);
    }
    if (filters.status) {
      sql += ' AND al.status = ?';
      params.push(filters.status);
    }
    if (filters.startDate) {
      sql += ' AND al.created_at >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ' AND al.created_at <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY al.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async logActivity(userId, action, details = {}, status = 'success', ipAddress = null) {
    await db.query(
      'INSERT INTO activity_logs (user_id, action, details, status, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, action, JSON.stringify(details), status, ipAddress]
    );
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

  static async safeTableQuery(sql) {
    try {
      const [rows] = await db.query(sql);
      return rows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getAllDatabaseData() {
    const tables = {
      users: `SELECT user_id, full_name, email, role, status, created_at FROM users ORDER BY user_id`,
      clubs: `SELECT * FROM clubs ORDER BY club_id`,
      club_executives: `SELECT ce.*, u.full_name AS executive_name, u.email, c.club_name
                        FROM club_executives ce
                        LEFT JOIN users u ON ce.user_id = u.user_id
                        LEFT JOIN clubs c ON ce.club_id = c.club_id
                        ORDER BY ce.club_id, ce.user_id`,
      join_requests: `SELECT jr.*, u.full_name, u.email, c.club_name
                      FROM join_requests jr
                      LEFT JOIN users u ON jr.user_id = u.user_id
                      LEFT JOIN clubs c ON jr.club_id = c.club_id
                      ORDER BY jr.request_date DESC`,
      memberships: `SELECT m.*, u.full_name, u.email, c.club_name
                    FROM memberships m
                    LEFT JOIN users u ON m.user_id = u.user_id
                    LEFT JOIN clubs c ON m.club_id = c.club_id
                    ORDER BY m.joined_at DESC`,
      events: `SELECT e.*, c.club_name
               FROM events e
               LEFT JOIN clubs c ON e.club_id = c.club_id
               ORDER BY e.event_date DESC, e.event_time DESC`,
      event_registrations: `SELECT er.*, u.full_name, u.email, e.title AS event_title
                            FROM event_registrations er
                            LEFT JOIN users u ON er.user_id = u.user_id
                            LEFT JOIN events e ON er.event_id = e.event_id
                            ORDER BY er.registered_at DESC`,
      announcements: `SELECT a.*, c.club_name
                      FROM announcements a
                      LEFT JOIN clubs c ON a.club_id = c.club_id
                      ORDER BY a.created_at DESC`
    };

    const result = {};
    for (const [name, sql] of Object.entries(tables)) {
      result[name] = await this.safeTableQuery(sql);
    }
    return result;
  }

}

module.exports = AdminService;