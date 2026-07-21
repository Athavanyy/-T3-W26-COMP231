const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

function mapRole(role) {
  switch (role) {
    case 'STUDENT':
      return 'Student';
    case 'CLUB_EXECUTIVE':
      return 'Club Executive';
    case 'ADMIN':
      return 'Administrator';
    default:
      return role;
  }
}

function mapEventStatus(status) {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'PUBLISHED':
      return 'Published';
    default:
      return status;
  }
}

function mapClubStatus(status) {
  switch (status) {
    case 'ACTIVE':
      return 'Approved';
    case 'PENDING':
      return 'Pending Approval';
    default:
      return status;
  }
}

async function query(sql, params = []) {
  return db.promise().query(sql, params);
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/clubs', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        c.club_id AS id,
        c.club_name AS name,
        c.category,
        c.description,
        c.meeting_details AS meetingDetails,
        c.status,
        COALESCE((SELECT COUNT(*) FROM memberships m WHERE m.club_id = c.club_id AND m.status = 'ACTIVE'), 0) AS members
      FROM clubs c
      ORDER BY c.created_at DESC
    `);

    const clubs = rows.map((club) => ({
      ...club,
      status: mapClubStatus(club.status)
    }));

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/clubs/:id', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        c.club_id AS id,
        c.club_name AS name,
        c.category,
        c.description,
        c.meeting_details AS meetingDetails,
        c.status,
        COALESCE((SELECT COUNT(*) FROM memberships m WHERE m.club_id = c.club_id AND m.status = 'ACTIVE'), 0) AS members
      FROM clubs c
      WHERE c.club_id = ?
    `, [req.params.id]);

    const club = rows[0] || null;
    res.json(club ? { ...club, status: mapClubStatus(club.status) } : {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        event_id AS id,
        club_id AS clubId,
        title,
        description,
        event_date AS date,
        event_time AS time,
        location,
        CASE
          WHEN status = 'PUBLISHED' THEN 'Published'
          WHEN status = 'DRAFT' THEN 'Draft'
          ELSE status
        END AS status
      FROM events
      ORDER BY event_date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/executive/events', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        event_id AS id,
        club_id AS clubId,
        title,
        description,
        event_date AS date,
        event_time AS time,
        location,
        CASE
          WHEN status = 'PUBLISHED' THEN 'Published'
          WHEN status = 'DRAFT' THEN 'Draft'
          ELSE status
        END AS status
      FROM events
      WHERE status = 'DRAFT'
      ORDER BY event_date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/executive/dashboard', async (req, res) => {
  try {
    const [clubs] = await query('SELECT COUNT(*) AS count FROM clubs');
    const [events] = await query('SELECT COUNT(*) AS count FROM events');
    res.json({ clubs: clubs[0].count, events: events[0].count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/executive/events/:id/publish', async (req, res) => {
  try {
    await query('UPDATE events SET status = ? WHERE event_id = ?', ['PUBLISHED', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/executive/announcements', async (req, res) => {
  try {
    const { title, content, message, clubId } = req.body;
    const bodyMessage = content || message || '';
    const club_id = clubId || 1;
    await query('INSERT INTO announcements (club_id, title, message, status) VALUES (?, ?, ?, ?)', [club_id, title, bodyMessage, 'PUBLISHED']);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/join-requests', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        jr.request_id AS id,
        jr.request_status AS status,
        jr.request_date AS requestDate,
        u.full_name AS student,
        u.email,
        c.club_name AS club
      FROM join_requests jr
      JOIN users u ON u.user_id = jr.user_id
      JOIN clubs c ON c.club_id = jr.club_id
      ORDER BY jr.request_date DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/join-requests/:id/confirmation', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        jr.request_id AS id,
        CASE
          WHEN jr.request_status = 'APPROVED' THEN 'Approved'
          WHEN jr.request_status = 'REJECTED' THEN 'Rejected'
          ELSE 'Submitted'
        END AS status,
        CONCAT('Your join request for ', c.club_name, ' was recorded.') AS message,
        c.club_name AS club
      FROM join_requests jr
      LEFT JOIN clubs c ON c.club_id = jr.club_id
      WHERE jr.request_id = ?
    `, [req.params.id]);

    const confirmation = rows[0] || {
      id: Number(req.params.id),
      status: 'Submitted',
      message: 'Your join request was recorded.'
    };

    res.json(confirmation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/join-requests/:id/approve', async (req, res) => {
  try {
    await query('UPDATE join_requests SET request_status = ? WHERE request_id = ?', ['APPROVED', req.params.id]);
    await query(`
      INSERT INTO memberships (user_id, club_id, status)
      SELECT user_id, club_id, 'ACTIVE'
      FROM join_requests
      WHERE request_id = ?
      ON DUPLICATE KEY UPDATE status = 'ACTIVE'
    `, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/join-requests/:id/reject', async (req, res) => {
  try {
    await query('UPDATE join_requests SET request_status = ? WHERE request_id = ?', ['REJECTED', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await query(`
      SELECT
        user_id AS id,
        full_name AS name,
        email,
        CASE
          WHEN role = 'STUDENT' THEN 'Student'
          WHEN role = 'CLUB_EXECUTIVE' THEN 'Club Executive'
          WHEN role = 'ADMIN' THEN 'Administrator'
          ELSE role
        END AS role,
        status
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await query(`
      SELECT
        user_id AS id,
        full_name AS name,
        email,
        CASE
          WHEN role = 'STUDENT' THEN 'Student'
          WHEN role = 'CLUB_EXECUTIVE' THEN 'Club Executive'
          WHEN role = 'ADMIN' THEN 'Administrator'
          ELSE role
        END AS role,
        CASE WHEN status = 'ACTIVE' THEN FALSE ELSE TRUE END AS isDisabled
      FROM users
      WHERE email = ? AND password_hash = ?
      LIMIT 1
    `, [email, password]);

    const user = rows[0] || null;
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const roleMap = {
      Student: 'STUDENT',
      'Club Executive': 'CLUB_EXECUTIVE',
      Administrator: 'ADMIN'
    };
    const { role } = req.body;
    await query('UPDATE users SET role = ? WHERE user_id = ?', [roleMap[role] || role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/clubs/:id/approve', async (req, res) => {
  try {
    await query('UPDATE clubs SET status = ? WHERE club_id = ?', ['ACTIVE', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));