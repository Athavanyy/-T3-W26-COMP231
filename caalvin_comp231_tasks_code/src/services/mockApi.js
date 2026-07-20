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

export const mockExecutiveMembers = [
  { id: 'm1', position: 'President', name: 'Avery Brooks', email: 'avery.brooks@ccms.edu', joinDate: '2024-01-15' },
  { id: 'm2', position: 'Vice President', name: 'Jordan Lee', email: 'jordan.lee@ccms.edu', joinDate: '2024-02-03' },
  { id: 'm3', position: 'Secretary', name: 'Sam Patel', email: 'sam.patel@ccms.edu', joinDate: '2024-03-12' },
  { id: 'm4', position: 'Treasurer', name: 'Taylor Reed', email: 'taylor.reed@ccms.edu', joinDate: '2024-04-08' }
];

export const mockTestUsers = [
  { id: 'student-001', name: 'Test Student', role: 'Student', isDisabled: false },
  { id: 'exec-001', name: 'Test Executive', role: 'Club Executive', isDisabled: false },
  { id: 'admin-001', name: 'Test Admin', role: 'Administrator', isDisabled: false },
  { id: 'disabled-001', name: 'Disabled User', role: 'Student', isDisabled: true }
];

export const mockDefaultUser = {
  id: 'student-001',
  name: 'Test Student',
  role: 'Student',
  isDisabled: false
};

export const mockMenuItems = [
  { label: 'Dashboard', to: '/student/clubs' },
  { label: 'Clubs', to: '/student/clubs' },
  { label: 'Events', to: '/student/events/select' },
  { label: 'Executive', to: '/executive/dashboard' },
  { label: 'Announcements', to: '/executive/announcements' },
  { label: 'Admin', to: '/admin/users/test-user-001/role' }
];

export const mockManageUsers = [
  { id: 'student-001', name: 'Jamie Carter', email: 'jamie.carter@student.ccms.edu', role: 'Student', status: 'Active' },
  { id: 'exec-001', name: 'Priya Singh', email: 'priya.singh@club.ccms.edu', role: 'Club Executive', status: 'Active' },
  { id: 'admin-001', name: 'Sofia Lee', email: 'sofia.lee@ccms.edu', role: 'Administrator', status: 'Active' }
];

export const mockJoinRequests = [
  { id: 'r1', student: 'Mia Chen', email: 'mia.chen@student.ccms.edu', club: 'Robotics Club', status: 'Pending', requestDate: '2026-07-10' },
  { id: 'r2', student: 'Noah Singh', email: 'noah.singh@student.ccms.edu', club: 'Art Society', status: 'Pending', requestDate: '2026-07-11' },
  { id: 'r3', student: 'Lina Gomez', email: 'lina.gomez@student.ccms.edu', club: 'Environmental Club', status: 'Pending', requestDate: '2026-07-12' }
];
