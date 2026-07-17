import http from 'http';
import { mockClubs, mockEvents, mockDashboard } from './src/services/mockApi.js';

const PORT = 3000;
let clubs = [...mockClubs];
let events = [...mockEvents];
const announcements = [];
const joinRequests = [
  { id: 'test-request-001', student: 'Test Student', email: 'test.student@student.ccms.edu', club: 'Math Club', status: 'Submitted', requestDate: '2026-07-16', message: 'Your join request was recorded successfully.' },
  { id: 'r1', student: 'Aiden Lee', email: 'aiden.lee@student.ccms.edu', club: 'AI Club', status: 'Pending', requestDate: '2026-07-15' },
  { id: 'r2', student: 'Mira Patel', email: 'mira.patel@student.ccms.edu', club: 'Cybersecurity Club', status: 'Pending', requestDate: '2026-07-14' }
];
const userRoles = { 'test-user-001': 'Administrator' };

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (path === '/api/clubs' && method === 'GET') {
    return sendJson(res, 200, clubs);
  }

  if (path.startsWith('/api/clubs/') && method === 'GET') {
    const clubId = path.split('/')[3];
    const club = clubs.find((item) => item.id === clubId);
    return club ? sendJson(res, 200, club) : sendJson(res, 404, { message: 'Club not found' });
  }

  if (path === '/api/events' && method === 'GET') {
    return sendJson(res, 200, events);
  }

  if (path.startsWith('/api/join-requests/') && path.endsWith('/confirmation') && method === 'GET') {
    const requestId = path.split('/')[2];
    const request = joinRequests.find((item) => item.id === requestId);
    return request ? sendJson(res, 200, request) : sendJson(res, 404, { message: 'Join request not found' });
  }

  if (path === '/api/executive/dashboard' && method === 'GET') {
    return sendJson(res, 200, mockDashboard);
  }

  if (path === '/api/executive/events' && method === 'GET') {
    return sendJson(res, 200, events);
  }

  if (path.startsWith('/api/executive/events/') && path.endsWith('/publish') && method === 'PUT') {
    const eventId = path.split('/')[3];
    const event = events.find((item) => item.id === eventId);
    const body = await parseBody(req);
    if (!event) {
      return sendJson(res, 404, { message: 'Event not found' });
    }
    event.status = 'Published';
    event.publishedAt = new Date().toISOString();
    event.publishedBy = body.publishedBy || 'executive';
    return sendJson(res, 200, event);
  }

  if (path === '/api/executive/announcements' && method === 'POST') {
    const announcement = await parseBody(req);
    const saved = { id: `a-${announcements.length + 1}`, ...announcement, createdAt: new Date().toISOString() };
    announcements.push(saved);
    return sendJson(res, 201, saved);
  }

  if (path.startsWith('/api/admin/users/') && path.endsWith('/role') && method === 'PUT') {
    const userId = path.split('/')[3];
    const body = await parseBody(req);
    userRoles[userId] = body.role || userRoles[userId] || 'Student';
    return sendJson(res, 200, { userId, role: userRoles[userId], ...body });
  }

  if (path.startsWith('/api/admin/clubs/') && path.endsWith('/approve') && method === 'PUT') {
    const clubId = path.split('/')[3];
    const club = clubs.find((item) => item.id === clubId);
    const body = await parseBody(req);
    if (!club) {
      return sendJson(res, 404, { message: 'Club not found' });
    }
    club.status = body.status || 'Approved';
    return sendJson(res, 200, club);
  }

  sendJson(res, 404, { message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}/api`);
});
