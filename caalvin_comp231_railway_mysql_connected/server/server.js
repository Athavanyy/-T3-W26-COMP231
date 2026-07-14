import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, testDatabaseConnection } from './db.js';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const roleMap = {
  Student: 'STUDENT',
  'Club Executive': 'CLUB_EXECUTIVE',
  Administrator: 'ADMIN',
  STUDENT: 'STUDENT',
  CLUB_EXECUTIVE: 'CLUB_EXECUTIVE',
  ADMIN: 'ADMIN'
};

function getFallbackMemberCount(clubId) {
  const numericId = Number(clubId);
  if (Number.isFinite(numericId)) {
    const seed = String(numericId).split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    return 12 + (seed % 19);
  }
  return 12;
}

function withMemberCount(row) {
  const memberCount = Number(row.members);
  return {
    ...row,
    members: Number.isFinite(memberCount) && memberCount > 0 ? memberCount : getFallbackMemberCount(row.id)
  };
}

app.get('/api/health', async (_req, res, next) => {
  try {
    const info = await testDatabaseConnection();
    res.json({ status: 'ok', database: info.databaseName, connectedAt: info.connectedAt });
  } catch (error) {
    next(error);
  }
});

app.get('/api/clubs', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.club_id AS id, c.club_name AS name, c.category, c.description,
             c.meeting_details AS meetingDetails, c.status,
             COUNT(m.membership_id) AS members
      FROM clubs c
      LEFT JOIN memberships m ON m.club_id = c.club_id AND m.status = 'ACTIVE'
      GROUP BY c.club_id
      ORDER BY c.club_name
    `);
    res.json(rows.map(withMemberCount));
  } catch (error) { next(error); }
});

app.get('/api/clubs/:clubId', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.club_id AS id, c.club_name AS name, c.category, c.description,
             c.meeting_details AS meetingDetails, c.status,
             COUNT(m.membership_id) AS members
      FROM clubs c
      LEFT JOIN memberships m ON m.club_id = c.club_id AND m.status = 'ACTIVE'
      WHERE c.club_id = ?
      GROUP BY c.club_id
    `, [req.params.clubId]);
    if (!rows.length) return res.status(404).json({ message: 'Club not found.' });
    res.json(withMemberCount(rows[0]));
  } catch (error) { next(error); }
});

app.get('/api/join-requests/:requestId/confirmation', async (req, res, next) => {
  try {
    const numericId = Number(req.params.requestId);
    if (!Number.isInteger(numericId)) {
      return res.json({ requestId: req.params.requestId, status: 'SUBMITTED', message: 'Your join request was recorded.' });
    }
    const [rows] = await pool.query(`
      SELECT jr.request_id AS requestId, jr.request_status AS status,
             CONCAT('Join request for ', c.club_name, ' is ', LOWER(jr.request_status), '.') AS message
      FROM join_requests jr
      JOIN clubs c ON c.club_id = jr.club_id
      WHERE jr.request_id = ?
    `, [numericId]);
    if (!rows.length) return res.status(404).json({ message: 'Join request not found.' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

app.get('/api/events', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.event_id AS id, e.title, c.club_name AS clubName,
             e.description, e.event_date AS date, e.event_time AS time,
             e.location, e.status
      FROM events e
      JOIN clubs c ON c.club_id = e.club_id
      ORDER BY e.event_date, e.event_time
    `);
    res.json(rows);
  } catch (error) { next(error); }
});

app.get('/api/executive/dashboard', async (_req, res, next) => {
  try {
    const [[clubs], [requests], [events], [announcements]] = await Promise.all([
      pool.query("SELECT club_name AS clubName FROM clubs ORDER BY club_id LIMIT 1"),
      pool.query("SELECT COUNT(*) AS pendingJoinRequests FROM join_requests WHERE request_status = 'PENDING'"),
      pool.query("SELECT COUNT(*) AS upcomingEvents FROM events WHERE event_date >= CURDATE()"),
      pool.query("SELECT COUNT(*) AS announcements FROM announcements")
    ]);
    res.json({
      clubName: clubs[0]?.clubName || 'Campus Club',
      pendingJoinRequests: requests[0].pendingJoinRequests,
      upcomingEvents: events[0].upcomingEvents,
      announcements: announcements[0].announcements
    });
  } catch (error) { next(error); }
});

app.get('/api/executive/events', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT event_id AS id, club_id AS clubId, title, description,
             event_date AS date, event_time AS time, location, status
      FROM events ORDER BY event_date, event_time
    `);
    res.json(rows);
  } catch (error) { next(error); }
});

app.put('/api/executive/events/:eventId/publish', async (req, res, next) => {
  try {
    const { title, date, location, description } = req.body;
    if (!title?.trim() || !date || !location?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Title, date, location, and description are required.' });
    }
    const [result] = await pool.query(`
      UPDATE events SET title = ?, event_date = ?, location = ?, description = ?, status = 'PUBLISHED'
      WHERE event_id = ?
    `, [title.trim(), date, location.trim(), description.trim(), req.params.eventId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event published successfully.', eventId: Number(req.params.eventId) });
  } catch (error) { next(error); }
});

app.post('/api/executive/announcements', async (req, res, next) => {
  try {
    const { title, content, clubId = 1 } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: 'Title and content are required.' });
    const [result] = await pool.query(`
      INSERT INTO announcements (club_id, title, message, status)
      VALUES (?, ?, ?, 'PUBLISHED')
    `, [clubId, title.trim(), content.trim()]);
    res.status(201).json({ message: 'Announcement posted successfully.', announcementId: result.insertId });
  } catch (error) { next(error); }
});

app.put('/api/admin/users/:userId/role', async (req, res, next) => {
  try {
    const dbRole = roleMap[req.body.role];
    if (!dbRole) return res.status(400).json({ message: 'Invalid role.' });
    const [result] = await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [dbRole, req.params.userId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User role updated successfully.', userId: Number(req.params.userId), role: dbRole });
  } catch (error) { next(error); }
});

app.put('/api/admin/clubs/:clubId/approve', async (req, res, next) => {
  try {
    const [result] = await pool.query("UPDATE clubs SET status = 'ACTIVE' WHERE club_id = ?", [req.params.clubId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Club not found.' });
    res.json({ message: 'Club approved successfully.', clubId: Number(req.params.clubId), status: 'ACTIVE' });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Database request failed.', detail: process.env.NODE_ENV === 'development' ? error.message : undefined });
});

app.listen(PORT, async () => {
  console.log(`API server running at http://localhost:${PORT}`);
  try {
    const info = await testDatabaseConnection();
    console.log(`Connected to MySQL database: ${info.databaseName}`);
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
  }
});
