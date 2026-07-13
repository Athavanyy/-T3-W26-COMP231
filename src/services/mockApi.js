export const mockClubs = [
  { id: 'club-001', name: 'AI Club', category: 'Technology', description: 'Students building AI projects and sharing machine learning knowledge.', status: 'Pending Approval', members: 42 },
  { id: 'club-002', name: 'Cybersecurity Club', category: 'Security', description: 'Hands-on labs, CTF practice, and security workshops.', status: 'Approved', members: 35 },
  { id: 'club-003', name: 'Robotics Club', category: 'Engineering', description: 'Build and program robotics systems for campus competitions.', status: 'Approved', members: 28 }
];

export const mockEvents = [
  { id: 'event-001', title: 'AI Project Night', clubName: 'AI Club', date: '2026-07-18', location: 'Room B201', status: 'Draft' },
  { id: 'event-002', title: 'Cybersecurity Workshop', clubName: 'Cybersecurity Club', date: '2026-07-20', location: 'Lab C104', status: 'Published' }
];

export const mockDashboard = {
  clubName: 'AI Club',
  pendingJoinRequests: 5,
  upcomingEvents: 2,
  announcements: 3
};
