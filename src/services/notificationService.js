const db = require("../config/database");

class NotificationService {
  static async getStudentPreferences(studentId) {
    const [rows] = await db.query(
      `
        SELECT
          m.club_id,
          c.club_name,
          COALESCE(np.email_enabled, 0) AS email_enabled
        FROM memberships m
        JOIN clubs c
          ON c.club_id = m.club_id
        LEFT JOIN notification_preferences np
          ON np.user_id = m.user_id
         AND np.club_id = m.club_id
        WHERE m.user_id = ?
          AND m.status = 'ACTIVE'
        ORDER BY c.club_name
      `,
      [studentId],
    );

    return rows;
  }

  static async updatePreference(studentId, clubId, emailEnabled) {
    // The student must be an active member of the selected club.
    const [memberships] = await db.query(
      `
        SELECT membership_id
        FROM memberships
        WHERE user_id = ?
          AND club_id = ?
          AND status = 'ACTIVE'
        LIMIT 1
      `,
      [studentId, clubId],
    );

    if (memberships.length === 0) {
      throw new Error(
        "You must be an active member of this club to change notifications",
      );
    }

    await db.query(
      `
        INSERT INTO notification_preferences
          (user_id, club_id, email_enabled)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          email_enabled = VALUES(email_enabled)
      `,
      [studentId, clubId, emailEnabled ? 1 : 0],
    );

    const [rows] = await db.query(
      `
        SELECT
          np.preference_id,
          np.user_id,
          np.club_id,
          c.club_name,
          np.email_enabled,
          np.updated_at
        FROM notification_preferences np
        JOIN clubs c
          ON c.club_id = np.club_id
        WHERE np.user_id = ?
          AND np.club_id = ?
      `,
      [studentId, clubId],
    );

    return rows[0];
  }

  static async getEligibleRecipients(clubId) {
    const [rows] = await db.query(
      `
        SELECT DISTINCT
          u.user_id,
          u.full_name,
          u.email
        FROM memberships m
        JOIN users u
          ON u.user_id = m.user_id
        JOIN notification_preferences np
          ON np.user_id = m.user_id
         AND np.club_id = m.club_id
        WHERE m.club_id = ?
          AND m.status = 'ACTIVE'
          AND u.status = 'ACTIVE'
          AND u.role = 'STUDENT'
          AND np.email_enabled = 1
      `,
      [clubId],
    );

    return rows;
  }
}

module.exports = NotificationService;