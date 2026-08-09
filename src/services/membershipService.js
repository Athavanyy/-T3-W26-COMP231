const db = require("../config/database");

class MembershipService {
  static async submitJoinRequest(studentId, clubId) {
    const [club] = await db.query(
      `SELECT *
     FROM clubs
     WHERE club_id = ?
       AND status = "ACTIVE"`,
      [clubId],
    );

    if (club.length === 0) {
      throw new Error("Club not found or not active");
    }

    // Current ACTIVE membership determines whether they are a member
    const [member] = await db.query(
      `SELECT *
     FROM memberships
     WHERE user_id = ?
       AND club_id = ?
       AND status = "ACTIVE"`,
      [studentId, clubId],
    );

    if (member.length > 0) {
      throw new Error("You are already a member of this club");
    }

    // Prevent duplicate pending requests
    const [pending] = await db.query(
      `SELECT *
     FROM join_requests
     WHERE user_id = ?
       AND club_id = ?
       AND request_status = "PENDING"`,
      [studentId, clubId],
    );

    if (pending.length > 0) {
      throw new Error("You already have a pending join request");
    }

    await db.query(
      `INSERT INTO join_requests
     (user_id, club_id, request_status)
     VALUES (?, ?, "PENDING")`,
      [studentId, clubId],
    );

    const [rows] = await db.query(
      `SELECT *
     FROM join_requests
     WHERE user_id = ?
       AND club_id = ?
       AND request_status = "PENDING"
     ORDER BY request_id DESC
     LIMIT 1`,
      [studentId, clubId],
    );

    return rows[0];
  }

  static async getPendingRequests(executiveId) {
    const [rows] = await db.query(
      `
      SELECT 
        jr.*,
        u.full_name,
        u.email,
        c.club_name
      FROM join_requests jr
      JOIN users u ON jr.user_id = u.user_id
      JOIN clubs c ON jr.club_id = c.club_id
      JOIN club_executives ce ON jr.club_id = ce.club_id
      WHERE ce.user_id = ?
        AND jr.request_status = "PENDING"
      ORDER BY jr.request_date DESC
    `,
      [executiveId],
    );

    return rows;
  }

  static async getMembers(executiveId) {
    const [rows] = await db.query(
      `
      SELECT 
        m.*,
        u.full_name,
        u.email,
        c.club_name
      FROM memberships m
      JOIN users u ON m.user_id = u.user_id
      JOIN clubs c ON m.club_id = c.club_id
      JOIN club_executives ce ON m.club_id = ce.club_id
      WHERE ce.user_id = ?
        AND m.status = "ACTIVE"
      ORDER BY c.club_name, u.full_name
    `,
      [executiveId],
    );

    return rows;
  }

  static async approveJoinRequest(executiveId, requestId) {
    const [req] = await db.query(
      `
      SELECT jr.*
      FROM join_requests jr
      JOIN club_executives ce ON jr.club_id = ce.club_id
      WHERE jr.request_id = ? AND ce.user_id = ?
    `,
      [requestId, executiveId],
    );

    if (req.length === 0) {
      throw new Error("Request not found or unauthorized");
    }

    const request = req[0];

    if (request.request_status !== "PENDING") {
      throw new Error("Request already processed");
    }

    // Create the active membership first
    await db.query(
      `
      INSERT INTO memberships (user_id, club_id, status)
      VALUES (?, ?, "ACTIVE")
    `,
      [request.user_id, request.club_id],
    );

    // Only mark the request approved after membership creation succeeds
    await db.query(
      `
      UPDATE join_requests
      SET request_status = "APPROVED"
      WHERE request_id = ?
    `,
      [requestId],
    );

    const [rows] = await db.query(
      `
      SELECT *
      FROM memberships
      WHERE user_id = ?
        AND club_id = ?
        AND status = "ACTIVE"
      ORDER BY membership_id DESC
      LIMIT 1
    `,
      [request.user_id, request.club_id],
    );

    return rows[0];
  }

  static async rejectJoinRequest(executiveId, requestId) {
    const [req] = await db.query(
      `
      SELECT jr.* 
      FROM join_requests jr
      JOIN club_executives ce ON jr.club_id = ce.club_id
      WHERE jr.request_id = ? AND ce.user_id = ?
    `,
      [requestId, executiveId],
    );
    if (req.length === 0) throw new Error("Request not found or unauthorized");
    if (req[0].request_status !== "PENDING")
      throw new Error("Request already processed");

    await db.query(
      'UPDATE join_requests SET request_status = "REJECTED" WHERE request_id = ?',
      [requestId],
    );
    const [rows] = await db.query(
      "SELECT * FROM join_requests WHERE request_id = ?",
      [requestId],
    );
    return rows[0];
  }

  static async removeMember(executiveId, membershipId) {
    const [mem] = await db.query(
      `
      SELECT 
        m.*,
        u.full_name,
        u.email,
        c.club_name
      FROM memberships m
      JOIN users u ON m.user_id = u.user_id
      JOIN clubs c ON m.club_id = c.club_id
      JOIN club_executives ce ON m.club_id = ce.club_id
      WHERE m.membership_id = ?
        AND ce.user_id = ?
        AND m.status = "ACTIVE"
    `,
      [membershipId, executiveId],
    );

    if (mem.length === 0) {
      throw new Error("Membership not found, inactive, or unauthorized");
    }

    await db.query(
      'UPDATE memberships SET status = "INACTIVE" WHERE membership_id = ?',
      [membershipId],
    );

    return {
      ...mem[0],
      status: "INACTIVE",
    };
  }

  static async getMembershipHistory(executiveId, filters = {}) {
    const { dateFrom, dateTo } = filters;

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new Error("Date From cannot be later than Date To");
    }

    let sql = `
    SELECT
      m.membership_id,
      m.user_id,
      m.club_id,
      m.status,
      m.joined_at,
      u.full_name,
      u.email,
      c.club_name
    FROM memberships m
    JOIN users u ON m.user_id = u.user_id
    JOIN clubs c ON m.club_id = c.club_id
    JOIN club_executives ce ON m.club_id = ce.club_id
    WHERE ce.user_id = ?
  `;

    const params = [executiveId];

    if (dateFrom) {
      sql += ` AND m.joined_at >= ?`;
      params.push(`${dateFrom} 00:00:00`);
    }

    if (dateTo) {
      sql += ` AND m.joined_at < DATE_ADD(?, INTERVAL 1 DAY)`;
      params.push(dateTo);
    }

    sql += ` ORDER BY m.joined_at DESC`;

    const [rows] = await db.query(sql, params);
    return rows;
  }
}

module.exports = MembershipService;
