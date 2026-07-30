const db = require('../config/database');

const AdminService = require('./adminService');

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
      sql += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
    }
    if (filters.clubId) {
      sql += ' AND e.club_id = ?';
      params.push(filters.clubId);
    }
    if (filters.category) {
      sql += ' AND c.category = ?';
      params.push(filters.category);
    }
    if (filters.dateFrom) {
      sql += ' AND e.event_date >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      sql += ' AND e.event_date <= ?';
      params.push(filters.dateTo);
    }
    sql += ' ORDER BY e.event_date ASC';

    const [rows] = await db.query(sql, params);
    return rows;
  }

  static async getEventDetails(eventId) {
    const [rows] = await db.query(`
      SELECT e.*, c.club_name 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      WHERE e.event_id = ?
    `, [eventId]);
    if (rows.length === 0) throw new Error('Event not found');
    if (rows[0].status !== 'PUBLISHED') throw new Error('Event is not available');
    return rows[0];
  }

  static async createEvent(executiveId, eventData) {
    const [club] = await db.query(`
      SELECT c.* 
      FROM clubs c
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
    `, [executiveId]);
    if (club.length === 0) throw new Error('You are not assigned to any club');

    const { title, description, eventDate, eventTime, location } = eventData;
    await db.query(
      `INSERT INTO events (club_id, title, description, event_date, event_time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, 'DRAFT')`,
      [club[0].club_id, title, description, eventDate, eventTime, location]
    );

    const [rows] = await db.query('SELECT * FROM events WHERE event_id = LAST_INSERT_ID()');

    await AdminService.logActivity(
      executiveId,
      'EVENT_CREATED',
      {
        eventId: rows[0].event_id,
        title: rows[0].title,
        clubId: club[0].club_id,
        clubName: club[0].club_name
      },
      'success'
    );

    return rows[0];
  }

  static async updateEvent(executiveId, eventId, updateData) {
    const [event] = await db.query(`
      SELECT e.*, c.club_id 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `, [eventId, executiveId]);
    if (event.length === 0) throw new Error('Event not found or unauthorized');
    if (event[0].status === 'CANCELLED' || event[0].status === 'COMPLETED') {
      throw new Error('Cannot update a cancelled or completed event');
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
      [title, description, eventDate, eventTime, location, eventId]
    );

    const [rows] = await db.query('SELECT * FROM events WHERE event_id = ?', [eventId]);

    await AdminService.logActivity(
      executiveId,
      'EVENT_UPDATED',
      {
        eventId: eventId,
        title: event[0].title,
        clubId: event[0].club_id
      },
      'success'
    );

    return rows[0];
  }

  static async publishEvent(executiveId, eventId) {
    const [event] = await db.query(`
      SELECT e.* 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `, [eventId, executiveId]);
    if (event.length === 0) throw new Error('Event not found or unauthorized');
    if (event[0].status !== 'DRAFT') throw new Error('Event is not in draft status');
    if (!event[0].title || !event[0].description || !event[0].event_date) {
      throw new Error('Cannot publish incomplete event');
    }

    await db.query('UPDATE events SET status = "PUBLISHED" WHERE event_id = ?', [eventId]);

    const [rows] = await db.query('SELECT * FROM events WHERE event_id = ?', [eventId]);

    await AdminService.logActivity(
      executiveId,
      'EVENT_PUBLISHED',
      {
        eventId: rows[0].event_id,
        title: rows[0].title,
        clubId: rows[0].club_id
      },
      'success'
    );

    return rows[0];
  }

  static async deleteEvent(executiveId, eventId) {
    const [event] = await db.query(`
      SELECT e.* 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `, [eventId, executiveId]);
    if (event.length === 0) throw new Error('Event not found or unauthorized');

    await db.query('UPDATE events SET status = "CANCELLED" WHERE event_id = ?', [eventId]);

    await AdminService.logActivity(
      executiveId,
      'EVENT_CANCELLED',
      {
        eventId: eventId,
        title: event[0].title,
        clubId: event[0].club_id
      },
      'success'
    );


    return { message: 'Event cancelled successfully' };
  }

  static async getClubEvents(executiveId) {
    const [rows] = await db.query(`
      SELECT e.* 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
      ORDER BY e.event_date DESC
    `, [executiveId]);
    return rows;
  }

  static async registerForEvent(studentId, eventId) {
    const [event] = await db.query('SELECT * FROM events WHERE event_id = ?', [eventId]);
    if (event.length === 0) throw new Error('Event not found');
    if (event[0].status !== 'PUBLISHED') throw new Error('Event is not open for registration');

    const [existing] = await db.query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ? AND registration_status = "REGISTERED"',
      [eventId, studentId]
    );
    if (existing.length > 0) throw new Error('You are already registered for this event');

    await db.query(
      'INSERT INTO event_registrations (event_id, user_id, registration_status) VALUES (?, ?, "REGISTERED")',
      [eventId, studentId]
    );

    const [rows] = await db.query(
      'SELECT * FROM event_registrations WHERE registration_id = LAST_INSERT_ID()'
    );

    await AdminService.logActivity(
      studentId,
      'EVENT_REGISTERATION',
      {
        eventId: eventId,
        eventTitle: event[0].title,
        clubId: event[0].club_id
      },
      'success'
    );

    return rows[0];
  }

  static async getEventRegistrations(executiveId, eventId) {
    const [event] = await db.query(`
      SELECT e.* 
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE e.event_id = ? AND ce.user_id = ?
    `, [eventId, executiveId]);
    if (event.length === 0) throw new Error('Event not found or unauthorized');

    const [rows] = await db.query(`
      SELECT er.*, u.full_name, u.email
      FROM event_registrations er
      JOIN users u ON er.user_id = u.user_id
      WHERE er.event_id = ? AND er.registration_status = "REGISTERED"
    `, [eventId]);
    return rows;
  }

  static async getExecutiveEventList(executiveId) {
    const [rows] = await db.query(`
      SELECT e.*, 
             (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.event_id AND registration_status = "REGISTERED") as participant_count
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      JOIN club_executives ce ON c.club_id = ce.club_id
      WHERE ce.user_id = ?
      ORDER BY e.event_date DESC
    `, [executiveId]);
    return rows;
  }

  static async exportRegistrations(executiveId, eventId) {
  // First, get the event name
    const [event] = await db.query(`
      SELECT title FROM events WHERE event_id = ?
    `, [eventId]);
  
    if (event.length === 0) {
      throw new Error('Event not found');
    }
  
    const registrations = await this.getEventRegistrations(executiveId, eventId);
  
    return {
      eventName: event[0].title,
      registrations: registrations.map(r => ({
        name: r.full_name,
        email: r.email,
        registeredAt: r.registered_at ? new Date(r.registered_at).toLocaleString() : ''
      }))
    };
  }
}

module.exports = EventService;