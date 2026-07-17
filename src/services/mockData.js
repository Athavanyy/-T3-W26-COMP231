// Mock Users
const users = [
  { id: 1, email: 'student@test.com', firstName: 'Sarah', lastName: 'Jones', role: 'student', isActive: true, studentId: 'S12345' },
  { id: 2, email: 'exec@test.com', firstName: 'Daniel', lastName: 'Smith', role: 'club_executive', isActive: true, studentId: 'S67890' },
  { id: 3, email: 'admin@test.com', firstName: 'Michael', lastName: 'Brown', role: 'administrator', isActive: true }
];

// Mock Clubs
const clubs = [
  { id: 1, name: 'Tech Club', description: 'All about technology', category: 'Academic', executiveId: 2, status: 'active', meetingDay: 'Wednesday', meetingTime: '15:00', meetingLocation: 'Room A101' },
  { id: 2, name: 'Art Society', description: 'Creative arts and crafts', category: 'Art', status: 'active', meetingDay: 'Thursday', meetingTime: '14:00', meetingLocation: 'Room B202' }
];

// Mock Events
const events = [
  { id: 1, clubId: 1, title: 'Hackathon 2026', description: 'Annual tech hackathon', date: '2026-08-15T09:00:00Z', time: '09:00', location: 'Main Hall', status: 'published', maxParticipants: 100 },
  { id: 2, clubId: 1, title: 'Python Workshop', description: 'Learn Python basics', date: '2026-08-20T14:00:00Z', time: '14:00', location: 'Lab 301', status: 'draft' }
];

// Mock Memberships
const memberships = [
  { id: 1, userId: 1, clubId: 1, status: 'active', joinedAt: '2026-07-01' },
  { id: 2, userId: 3, clubId: 1, status: 'pending' }
];

// Mock Registrations
const registrations = [
  { id: 1, userId: 1, eventId: 1, status: 'registered', registeredAt: '2026-07-10' }
];

// Mock Announcements
const announcements = [
  { id: 1, clubId: 1, authorId: 2, title: 'Welcome to Tech Club!', content: 'Our first meeting is tomorrow.', status: 'published', publishedAt: '2026-07-01' }
];

// Mock Activity Logs
const activityLogs = [
  { id: 1, userId: 1, action: 'LOGIN_SUCCESS', details: {}, status: 'success', createdAt: '2026-07-12T10:00:00Z' }
];

module.exports = { users, clubs, events, memberships, registrations, announcements, activityLogs };