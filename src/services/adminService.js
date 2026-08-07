const db = require("../config/database");

class AdminService {
  // USER MANAGEMENT
  static async getAllUsers(filters = {}) {
    let sql = `
      SELECT user_id, full_name, email, role, status, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (filters.role) {
      sql += " AND role = ?";
      params.push(filters.role);
    }

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.keyword) {
      sql += " AND (full_name LIKE ? OR email LIKE ?)";
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    sql += " ORDER BY created_at DESC, user_id DESC";

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getUserById(userId) {
    const [rows] = await db.query(
      `SELECT user_id, full_name, email, role, status, created_at
       FROM users
       WHERE user_id = ?`,
      [userId],
    );

    if (rows.length === 0) throw new Error("User not found");
    return rows[0];
  }

  static async addUser(adminId, userData) {
    const { fullName, email, password, role, status } = userData;

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();
    const cleanName = String(fullName || "").trim();
    const selectedRole = role || "STUDENT";
    const selectedStatus = status || "ACTIVE";

    const validRoles = ["STUDENT", "CLUB_EXECUTIVE", "ADMIN"];
    const validStatuses = ["ACTIVE", "INACTIVE", "DISABLED"];

    if (!cleanName) throw new Error("Full name is required");
    if (!cleanEmail) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (!validRoles.includes(selectedRole)) throw new Error("Invalid role");
    if (!validStatuses.includes(selectedStatus))
      throw new Error("Invalid status");

    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [cleanEmail],
    );

    if (existing.length > 0) {
      throw new Error("A user with this email already exists");
    }

    await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, password, selectedRole, selectedStatus],
    );

    const [created] = await db.query(
      `SELECT user_id, full_name, email, role, status, created_at
       FROM users
       WHERE email = ?`,
      [cleanEmail],
    );

    return created[0];
  }

  static async updateUserRole(adminId, userId, newRole) {
    const validRoles = ["STUDENT", "CLUB_EXECUTIVE", "ADMIN"];
    if (!validRoles.includes(newRole)) throw new Error("Invalid role");

    const [user] = await db.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [userId],
    );

    if (user.length === 0) throw new Error("User not found");

    await db.query("UPDATE users SET role = ? WHERE user_id = ?", [
      newRole,
      userId,
    ]);

    return await this.getUserById(userId);
  }

  static async disableUser(adminId, userId) {
    const [user] = await db.query(
      "SELECT status FROM users WHERE user_id = ?",
      [userId],
    );

    if (user.length === 0) throw new Error("User not found");

    if (user[0].status === "INACTIVE" || user[0].status === "DISABLED") {
      throw new Error("User is already disabled");
    }

    await db.query('UPDATE users SET status = "INACTIVE" WHERE user_id = ?', [
      userId,
    ]);

    return await this.getUserById(userId);
  }

  static async enableUser(adminId, userId) {
    const [user] = await db.query(
      "SELECT status FROM users WHERE user_id = ?",
      [userId],
    );

    if (user.length === 0) throw new Error("User not found");
    if (user[0].status === "ACTIVE") throw new Error("User is already active");

    await db.query('UPDATE users SET status = "ACTIVE" WHERE user_id = ?', [
      userId,
    ]);

    return await this.getUserById(userId);
  }

  static async getClubExecutives() {
    const [rows] = await db.query(`
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      ce.club_id
    FROM users u
    LEFT JOIN club_executives ce
      ON ce.user_id = u.user_id
    WHERE u.role = 'CLUB_EXECUTIVE'
      AND u.status = 'ACTIVE'
    ORDER BY u.full_name ASC
  `);

    return rows;
  }

  static async assignExecutiveToClub(adminId, clubId, executiveUserId) {
    const [clubs] = await db.query(
      `
      SELECT club_id, club_name
      FROM clubs
      WHERE club_id = ?
    `,
      [clubId]
    );

    if (clubs.length === 0) {
      throw new Error("Club not found");
    }

    const [users] = await db.query(
      `
      SELECT user_id, full_name, role, status
      FROM users
      WHERE user_id = ?
    `,
      [executiveUserId]
    );

    if (users.length === 0) {
      throw new Error("Executive user not found");
    }

    const executive = users[0];

    if (executive.role !== "CLUB_EXECUTIVE") {
      throw new Error("Selected user is not a Club Executive");
    }

    if (executive.status !== "ACTIVE") {
      throw new Error("Selected Club Executive is not active");
    }

    // Prevent one executive from being assigned to several clubs.
    const [currentAssignment] = await db.query(
      `
      SELECT ce.club_id, c.club_name
      FROM club_executives ce
      JOIN clubs c
        ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
        AND ce.club_id <> ?
    `,
      [executiveUserId, clubId]
    );

    if (currentAssignment.length > 0) {
      throw new Error(
        `${executive.full_name} is already assigned to ${currentAssignment[0].club_name}`
      );
    }

    // Keep only one executive assigned to this club.
    await db.query(
      `
      DELETE FROM club_executives
      WHERE club_id = ?
    `,
      [clubId]
    );

    await db.query(
      `
      INSERT INTO club_executives (user_id, club_id)
      VALUES (?, ?)
    `,
      [executiveUserId, clubId]
    );

    await this.logActivity(
      adminId,
      "CLUB_EXECUTIVE_ASSIGNED",
      {
        clubId: Number(clubId),
        clubName: clubs[0].club_name,
        executiveUserId: Number(executiveUserId),
        executiveName: executive.full_name
      },
      "success"
    );

    return {
      club_id: Number(clubId),
      club_name: clubs[0].club_name,
      executive_user_id: Number(executiveUserId),
      executive_name: executive.full_name
    };
  }

  //ACTIVITY MONITORING
  // ===== ACTIVITY LOGGING =====

  static async getRecentActivities(limit = 100) {
    const [rows] = await db.query(`
    SELECT al.log_id, al.user_id, u.full_name as user_name, al.action, al.details, al.status, al.created_at
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    ORDER BY al.created_at DESC
    LIMIT ?
  `, [parseInt(limit)]);
    return rows;
  }

  static async getActivityLogs(filters = {}) {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      throw new Error("Start date cannot be later than end date");
    }

    let sql = `
    SELECT al.log_id, 
           al.user_id,
           u.full_name as user_name,    
           u.email as user_email,       
           al.action, 
           al.details, 
           al.status, 
           al.created_at
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
      sql += " AND al.created_at >= ?";
      params.push(`${filters.startDate} 00:00:00`);
    }

    if (filters.endDate) {
      sql += " AND al.created_at < DATE_ADD(?, INTERVAL 1 DAY)";
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
    const [rows] = await db.query(`
    SELECT al.log_id, al.user_id, u.full_name as user_name, al.action, al.details, al.status, al.created_at
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    WHERE LOWER(al.status) IN ('failure', 'suspicious')
    ORDER BY al.created_at DESC
  `);
    return rows;
  }

  // REPORT GENERATION
  static async generateReport(reportType, filters = {}) {
    switch (reportType) {
      case "club_activity":
        return await this.getClubActivityReport(filters);
      case "event_participation":
        return await this.getEventParticipationReport(filters);
      case "user_engagement":
        return await this.getUserEngagementReport(filters);
      case "membership_stats":
        return await this.getMembershipStatsReport(filters);
      default:
        throw new Error("Invalid report type");
    }
  }

  static async getClubActivityReport(filters = {}) {
    let sql = `
      SELECT
        c.club_id,
        c.club_name,
        c.category,
        c.status,
        COUNT(DISTINCT m.membership_id) AS member_count,
        COUNT(DISTINCT e.event_id) AS event_count,
        COUNT(DISTINCT jr.request_id) AS pending_requests,
        COUNT(DISTINCT a.announcement_id) AS announcement_count
      FROM clubs c
      LEFT JOIN memberships m ON m.club_id = c.club_id AND m.status = 'ACTIVE'
      LEFT JOIN events e ON e.club_id = c.club_id
      LEFT JOIN join_requests jr ON jr.club_id = c.club_id AND jr.request_status = 'PENDING'
      LEFT JOIN announcements a ON a.club_id = c.club_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.status) {
      sql += " AND c.status = ?";
      params.push(filters.status);
    }

    sql += `
      GROUP BY c.club_id, c.club_name, c.category, c.status
      ORDER BY c.club_name
    `;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getEventParticipationReport(filters = {}) {
    let sql = `
      SELECT
        e.event_id,
        e.title,
        c.club_name,
        e.event_date,
        e.event_time,
        e.location,
        e.status,
        COUNT(er.registration_id) AS participant_count
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      LEFT JOIN event_registrations er
        ON er.event_id = e.event_id
        AND er.registration_status = 'REGISTERED'
      WHERE 1=1
    `;

    const params = [];

    if (filters.status) {
      sql += " AND e.status = ?";
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      sql += " AND e.event_date >= ?";
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      sql += " AND e.event_date <= ?";
      params.push(filters.dateTo);
    }

    sql += `
      GROUP BY e.event_id, e.title, c.club_name, e.event_date, e.event_time, e.location, e.status
      ORDER BY e.event_date DESC, e.event_time DESC
    `;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getUserEngagementReport(filters = {}) {
    let sql = `
      SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.status,
        COUNT(DISTINCT m.membership_id) AS club_memberships,
        COUNT(DISTINCT er.registration_id) AS event_registrations,
        COUNT(DISTINCT jr.request_id) AS join_requests
      FROM users u
      LEFT JOIN memberships m ON m.user_id = u.user_id AND m.status = 'ACTIVE'
      LEFT JOIN event_registrations er ON er.user_id = u.user_id AND er.registration_status = 'REGISTERED'
      LEFT JOIN join_requests jr ON jr.user_id = u.user_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.role) {
      sql += " AND u.role = ?";
      params.push(filters.role);
    }

    if (filters.status) {
      sql += " AND u.status = ?";
      params.push(filters.status);
    }

    sql += `
      GROUP BY u.user_id, u.full_name, u.email, u.role, u.status
      ORDER BY u.full_name
    `;

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getMembershipStatsReport(filters = {}) {
    const [rows] = await db.query(`
      SELECT
        c.category,
        COUNT(DISTINCT c.club_id) AS club_count,
        COUNT(DISTINCT m.membership_id) AS active_memberships,
        COUNT(DISTINCT jr.request_id) AS pending_requests,
        COUNT(DISTINCT e.event_id) AS event_count
      FROM clubs c
      LEFT JOIN memberships m ON c.club_id = m.club_id AND m.status = 'ACTIVE'
      LEFT JOIN join_requests jr ON c.club_id = jr.club_id AND jr.request_status = 'PENDING'
      LEFT JOIN events e ON c.club_id = e.club_id
      WHERE c.category IS NOT NULL
      GROUP BY c.category
      ORDER BY c.category
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
                      ORDER BY a.created_at DESC`,
    };

    const result = {};
    for (const [name, sql] of Object.entries(tables)) {
      result[name] = await this.safeTableQuery(sql);
    }

    return result;
  }
}

module.exports = AdminService;
