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

  // ACTIVITY MONITORING
  static baseActivitySql() {
    return `
      SELECT * FROM (
        SELECT
          'USER_CREATED' AS action_type,
          u.created_at AS activity_date,
          u.full_name AS actor_name,
          u.email AS actor_email,
          u.status AS status,
          CONCAT('User account created with role ', u.role) AS details
        FROM users u

        UNION ALL

        SELECT
          'CLUB_CREATED' AS action_type,
          c.created_at AS activity_date,
          c.club_name AS actor_name,
          NULL AS actor_email,
          c.status AS status,
          CONCAT('Club category: ', COALESCE(c.category, 'N/A')) AS details
        FROM clubs c

        UNION ALL

        SELECT
          'JOIN_REQUEST' AS action_type,
          jr.request_date AS activity_date,
          u.full_name AS actor_name,
          u.email AS actor_email,
          jr.request_status AS status,
          CONCAT('Join request for club: ', c.club_name) AS details
        FROM join_requests jr
        JOIN users u ON jr.user_id = u.user_id
        JOIN clubs c ON jr.club_id = c.club_id

        UNION ALL

        SELECT
          'MEMBERSHIP' AS action_type,
          m.joined_at AS activity_date,
          u.full_name AS actor_name,
          u.email AS actor_email,
          m.status AS status,
          CONCAT('Membership for club: ', c.club_name) AS details
        FROM memberships m
        JOIN users u ON m.user_id = u.user_id
        JOIN clubs c ON m.club_id = c.club_id

        UNION ALL

        SELECT
          'EVENT_CREATED' AS action_type,
          e.created_at AS activity_date,
          c.club_name AS actor_name,
          NULL AS actor_email,
          e.status AS status,
          CONCAT('Event: ', e.title, ' at ', e.location) AS details
        FROM events e
        JOIN clubs c ON e.club_id = c.club_id

        UNION ALL

        SELECT
          'EVENT_REGISTRATION' AS action_type,
          er.registered_at AS activity_date,
          u.full_name AS actor_name,
          u.email AS actor_email,
          er.registration_status AS status,
          CONCAT('Registration for event: ', e.title) AS details
        FROM event_registrations er
        JOIN users u ON er.user_id = u.user_id
        JOIN events e ON er.event_id = e.event_id

        UNION ALL

        SELECT
          'ANNOUNCEMENT' AS action_type,
          a.created_at AS activity_date,
          c.club_name AS actor_name,
          NULL AS actor_email,
          a.status AS status,
          CONCAT('Announcement: ', a.title) AS details
        FROM announcements a
        JOIN clubs c ON a.club_id = c.club_id
      ) activities
      WHERE 1=1
    `;
  }

  static async getRecentActivities() {
    return await this.getActivityLogs({ limit: 10 });
  }

  static async getActivityLogs(filters = {}) {
    let sql = this.baseActivitySql();
    const params = [];

    if (filters.actionType) {
      sql += " AND action_type = ?";
      params.push(filters.actionType);
    }

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.issueOnly) {
      sql +=
        " AND UPPER(status) IN ('INACTIVE', 'DISABLED', 'REJECTED', 'CANCELLED', 'REMOVED')";
    }

    if (filters.dateFrom) {
      sql += " AND activity_date >= ?";
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      sql += " AND activity_date <= DATE_ADD(?, INTERVAL 1 DAY)";
      params.push(filters.dateTo);
    }

    if (filters.keyword) {
      sql += " AND (actor_name LIKE ? OR actor_email LIKE ? OR details LIKE ?)";
      params.push(
        `%${filters.keyword}%`,
        `%${filters.keyword}%`,
        `%${filters.keyword}%`,
      );
    }

    const limit = Math.min(Number(filters.limit) || 100, 200);
    sql += " ORDER BY activity_date DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getFailedActivities(filters = {}) {
    return await this.getActivityLogs({
      ...filters,
      limit: filters.limit || 100,
      issueOnly: true,
    });
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
  static csvEscape(value) {
    if (value === null || value === undefined) return "";

    let text = "";

    if (value instanceof Date) {
      text = value.toISOString();
    } else if (typeof value === "object") {
      text = JSON.stringify(value);
    } else {
      text = String(value);
    }

    return `"${text.replaceAll('"', '""')}"`;
  }

  static rowsToCsv(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return "";
    }

    const columns = Array.from(
      new Set(rows.flatMap((row) => Object.keys(row || {}))),
    );

    const header = columns.map((column) => this.csvEscape(column)).join(",");

    const body = rows
      .map((row) =>
        columns.map((column) => this.csvEscape(row[column])).join(","),
      )
      .join("\n");

    return `${header}\n${body}`;
  }

  static async exportReport(reportType, filters = {}) {
    const rows = await this.generateReport(reportType, filters);
    const csv = this.rowsToCsv(rows);

    const cleanReportType = String(reportType || "report")
      .replace(/[^a-z0-9_-]/gi, "_")
      .toLowerCase();

    const date = new Date().toISOString().slice(0, 10);

    return {
      filename: `${cleanReportType}_${date}.csv`,
      rowCount: Array.isArray(rows) ? rows.length : 0,
      csv,
      rows,
    };
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
