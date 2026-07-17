const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());

app.get('/api/clubs', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM clubs');
  res.json(rows);
});

app.get('/api/clubs/:id', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM clubs WHERE id = ?', [req.params.id]);
  res.json(rows[0] || {});
});

app.get('/api/events', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM events');
  res.json(rows);
});

app.get('/api/executive/events', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM events WHERE status = "draft"');
  res.json(rows);
});

app.get('/api/executive/dashboard', async (req, res) => {
  const [clubs] = await db.promise().query('SELECT COUNT(*) as count FROM clubs');
  const [events] = await db.promise().query('SELECT COUNT(*) as count FROM events');
  res.json({ clubs: clubs[0].count, events: events[0].count });
});

app.put('/api/executive/events/:id/publish', async (req, res) => {
  await db.promise().query('UPDATE events SET status = "published" WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.post('/api/executive/announcements', async (req, res) => {
  const { title, message } = req.body;
  await db.promise().query('INSERT INTO announcements (title, message) VALUES (?, ?)', [title, message]);
  res.json({ success: true });
});

app.get('/api/join-requests/:id/confirmation', async (req, res) => {
  const [rows] = await db.promise().query('SELECT * FROM join_requests WHERE id = ?', [req.params.id]);
  res.json(rows[0] || {});
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  const { role } = req.body;
  await db.promise().query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ success: true });
});

app.put('/api/admin/clubs/:id/approve', async (req, res) => {
  await db.promise().query('UPDATE clubs SET status="Approved" WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

app.listen(5000, () => console.log('Backend running on port 5000'));