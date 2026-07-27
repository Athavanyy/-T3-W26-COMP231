const db = require("../config/database");

class ClubService {
  static async browseClubs(filters = {}) {
    let sql = 'SELECT * FROM clubs WHERE status = "ACTIVE"';
    const params = [];

    if (filters.category) {
      sql += " AND category = ?";
      params.push(filters.category);
    }
    if (filters.keyword) {
      sql += " AND (club_name LIKE ? OR description LIKE ?)";
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getClubDetails(clubId) {
    const [rows] = await db.query(
      `
      SELECT c.*, 
             (SELECT COUNT(*) FROM memberships WHERE club_id = c.club_id AND status = "ACTIVE") as member_count,
             (SELECT COUNT(*) FROM events WHERE club_id = c.club_id AND status = "PUBLISHED") as event_count
      FROM clubs c
      WHERE c.club_id = ?
    `,
      [clubId],
    );
    if (rows.length === 0) throw new Error("Club not found");
    return rows[0];
  }

  static async getClubCategories() {
    const [rows] = await db.query(
      'SELECT DISTINCT category FROM clubs WHERE status = "ACTIVE" AND category IS NOT NULL',
    );
    return rows.map((r) => r.category);
  }

  static async getMyClubs(executiveId) {
    const [rows] = await db.query(
      `
    SELECT c.* 
    FROM clubs c
    JOIN club_executives ce ON c.club_id = ce.club_id
    WHERE ce.user_id = ?
    ORDER BY c.club_name
  `,
      [executiveId],
    );

    if (rows.length === 0) throw new Error("You are not assigned to any club");

    return rows;
  }

  static async getMyClub(executiveId) {
    const clubs = await this.getMyClubs(executiveId);
    return clubs[0];
  }

  static async updateClubProfile(executiveId, updateData) {
    const club = await this.getMyClub(executiveId);
    const { name, club_name, description, category, meeting_details } =
      updateData;
    await db.query(
      `UPDATE clubs
       SET club_name = COALESCE(?, club_name),
           description = COALESCE(?, description),
           category = COALESCE(?, category),
           meeting_details = COALESCE(?, meeting_details)
       WHERE club_id = ?`,
      [
        name || club_name || null,
        description || null,
        category || null,
        meeting_details || null,
        club.club_id,
      ],
    );
    return await this.getClubDetails(club.club_id);
  }
  static async updateClubProfileById(executiveId, clubId, updateData) {
    const [access] = await db.query(
      `
    SELECT 1
    FROM club_executives
    WHERE user_id = ? AND club_id = ?
  `,
      [executiveId, clubId],
    );

    if (access.length === 0) {
      throw new Error("You are not assigned to this club");
    }

    const { name, club_name, description, category, meeting_details } =
      updateData;

    await db.query(
      `UPDATE clubs
     SET club_name = COALESCE(?, club_name),
         description = COALESCE(?, description),
         category = COALESCE(?, category),
         meeting_details = COALESCE(?, meeting_details)
     WHERE club_id = ?`,
      [
        name || club_name || null,
        description || null,
        category || null,
        meeting_details || null,
        clubId,
      ],
    );

    return await this.getClubDetails(clubId);
  }

  static async getAllClubs(filters = {}) {
    let sql = "SELECT * FROM clubs WHERE 1=1";
    const params = [];

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }
    if (filters.keyword) {
      sql += " AND (club_name LIKE ? OR description LIKE ?)";
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async approveClub(adminId, clubId) {
    const [rows] = await db.query(
      'SELECT * FROM clubs WHERE club_id = ? AND status = "PENDING"',
      [clubId],
    );
    if (rows.length === 0) throw new Error("Club not found or not pending");
    await db.query('UPDATE clubs SET status = "ACTIVE" WHERE club_id = ?', [
      clubId,
    ]);
    return await this.getClubDetails(clubId);
  }

  static async updateClubStatus(adminId, clubId, status) {
    const validStatuses = ["PENDING", "ACTIVE", "INACTIVE"];
    if (!validStatuses.includes(status)) throw new Error("Invalid status");
    await db.query("UPDATE clubs SET status = ? WHERE club_id = ?", [
      status,
      clubId,
    ]);
    return await this.getClubDetails(clubId);
  }

  static async removeClub(adminId, clubId) {
    await db.query('UPDATE clubs SET status = "INACTIVE" WHERE club_id = ?', [
      clubId,
    ]);
    return { message: "Club removed successfully" };
  }
}

module.exports = ClubService;
