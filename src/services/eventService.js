const db = require("../config/database");

class EventService {
  static async browseEvents(filters = {}) {
    let sql = `
      SELECT e.*, c.club_name 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      WHERE e.status = "PUBLISHED"
    `;
    const params = [];

    if (filters.keyword) {
      sql += " AND (e.title LIKE ? OR e.description LIKE ?)";
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }
    if (filters.clubId) {
      sql += " AND e.club_id = ?";
      params.push(filters.clubId);
    }
    if (filters.category) {
      sql += " AND c.category = ?";
      params.push(filters.category);
    }
    if (filters.dateFrom) {
      sql += " AND e.event_date >= ?";
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += " AND e.event_date <= ?";
      params.push(filters.dateTo);
    }
    sql += " ORDER BY e.event_date ASC";

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getEventDetails(eventId) {
    const [rows] = await db.query(
      `
      SELECT e.*, c.club_name 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      WHERE e.event_id = ?
    `,
      [eventId],
    );
    if (rows.length === 0) throw new Error("Event not found");
    if (rows[0].status !== "PUBLISHED")
      throw new Error("Event is not available");
    return rows[0];
  }

  static async createEvent(executiveId, eventData) {
    const { clubId, title, description, eventDate, eventTime, location } =
      eventData;

    let selectedClubId = clubId ? Number(clubId) : null;

    if (selectedClubId) {
      const [access] = await db.query(
        `
        SELECT c.*
        FROM clubs c
        JOIN club_executives ce ON c.club_id = ce.club_id
        WHERE ce.user_id = ? AND c.club_id = ?
      `,
        [executiveId, selectedClubId],
      );

      if (access.length === 0) {
        throw new Error("You are not assigned to this club");
      }
    } else {
      const [clubs] = await db.query(
        `
        SELECT c.*
        FROM clubs c
        JOIN club_executives ce ON c.club_id = ce.club_id
        WHERE ce.user_id = ?
        ORDER BY c.club_name
      `,
        [executiveId],
      );

      if (clubs.length === 0)
        throw new Error("You are not assigned to any club");
      selectedClubId = clubs[0].club_id;
    }

    await db.query(
      `INSERT INTO events (club_id, title, description, event_date, event_time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, 'DRAFT')`,
      [selectedClubId, title, description, eventDate, eventTime, location],
    );

    const [rows] = await db.query(`
      SELECT e.*, c.club_name
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      WHERE e.event_id = LAST_INSERT_ID()
    `);

    return rows[0];
  }

  static async updateEvent(executiveId, eventId, updateData) {
    const [event] = await db.query(
      `
      SELECT e.*, c.club_id 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `,
      [eventId, executiveId],
    );
    if (event.length === 0) throw new Error("Event not found or unauthorized");
    if (event[0].status === "CANCELLED" || event[0].status === "COMPLETED") {
      throw new Error("Cannot update a cancelled or completed event");
    }

    const { title, description, eventDate, eventTime, location } = updateData;
    await db.query(
      `UPDATE events 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           event_date = COALESCE(?, event_date),
           event_time = COALESCE(?, event_time),
           location = COALESCE(?, location)
       WHERE event_id = ?`,
      [title, description, eventDate, eventTime, location, eventId],
    );

    const [rows] = await db.query("SELECT * FROM events WHERE event_id = ?", [
      eventId,
    ]);
    return rows[0];
  }

  static async publishEvent(executiveId, eventId) {
    const [event] = await db.query(
      `
      SELECT e.* 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `,
      [eventId, executiveId],
    );
    if (event.length === 0) throw new Error("Event not found or unauthorized");
    if (event[0].status !== "DRAFT")
      throw new Error("Event is not in draft status");
    if (!event[0].title || !event[0].description || !event[0].event_date) {
      throw new Error("Cannot publish incomplete event");
    }

    await db.query(
      'UPDATE events SET status = "PUBLISHED" WHERE event_id = ?',
      [eventId],
    );
    const [rows] = await db.query("SELECT * FROM events WHERE event_id = ?", [
      eventId,
    ]);
    return rows[0];
  }

  static async deleteEvent(executiveId, eventId) {
    const [event] = await db.query(
      `
      SELECT e.* 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `,
      [eventId, executiveId],
    );
    if (event.length === 0) throw new Error("Event not found or unauthorized");

    await db.query(
      'UPDATE events SET status = "CANCELLED" WHERE event_id = ?',
      [eventId],
    );
    return { message: "Event cancelled successfully" };
  }

  static async getClubEvents(executiveId) {
    const [rows] = await db.query(
      `
      SELECT 
        e.*,
        c.club_name,
        (
          SELECT COUNT(*)
          FROM event_registrations er
          WHERE er.event_id = e.event_id
            AND er.registration_status = "REGISTERED"
        ) AS participant_count
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
      ORDER BY e.event_date DESC, e.event_time DESC
    `,
      [executiveId],
    );

    return rows;
  }

  static async registerForEvent(studentId, eventId) {
    const [event] = await db.query("SELECT * FROM events WHERE event_id = ?", [
      eventId,
    ]);
    if (event.length === 0) throw new Error("Event not found");
    if (event[0].status !== "PUBLISHED")
      throw new Error("Event is not open for registration");

    const [existing] = await db.query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ? AND registration_status = "REGISTERED"',
      [eventId, studentId],
    );
    if (existing.length > 0)
      throw new Error("You are already registered for this event");

    await db.query(
      'INSERT INTO event_registrations (event_id, user_id, registration_status) VALUES (?, ?, "REGISTERED")',
      [eventId, studentId],
    );

    const [rows] = await db.query(
      "SELECT * FROM event_registrations WHERE registration_id = LAST_INSERT_ID()",
    );
    return rows[0];
  }

  static async getEventRegistrations(executiveId, eventId) {
    const [event] = await db.query(
      `
      SELECT e.*, c.club_name
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ?
        AND ce.user_id = ?
    `,
      [eventId, executiveId],
    );

    if (event.length === 0) {
      throw new Error("Event not found or unauthorized");
    }

    const [rows] = await db.query(
      `
      SELECT 
        er.*,
        u.full_name,
        u.email,
        e.title AS event_title,
        c.club_name
      FROM event_registrations er
      JOIN users u ON er.user_id = u.user_id
      JOIN events e ON er.event_id = e.event_id
      JOIN clubs c ON e.club_id = c.club_id
      WHERE er.event_id = ?
        AND er.registration_status = "REGISTERED"
      ORDER BY er.registered_at DESC
    `,
      [eventId],
    );

    return rows;
  }

  static async getExecutiveEventList(executiveId) {
    const [rows] = await db.query(
      `
      SELECT 
        e.*,
        c.club_name,
        (
          SELECT COUNT(*)
          FROM event_registrations er
          WHERE er.event_id = e.event_id
            AND er.registration_status = "REGISTERED"
        ) AS participant_count
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
      ORDER BY e.event_date DESC, e.event_time DESC
    `,
      [executiveId],
    );

    return rows;
  }

  static async exportRegistrations(executiveId, eventId) {
    const registrations = await this.getEventRegistrations(
      executiveId,
      eventId,
    );
    return registrations.map((r) => ({
      name: r.full_name,
      email: r.email,
      registeredAt: r.registered_at,
    }));
  }
}

module.exports = EventService;
