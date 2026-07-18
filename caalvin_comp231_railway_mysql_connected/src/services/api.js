const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function dedupeClubs(clubs) {
  const seen = new Set();
  return clubs.filter((club) => {
    const key = club.id ?? club._id ?? club.name;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export const api = {
  getClubs: async () => {
    const data = await request('/clubs');
    const clubs = Array.isArray(data) ? data : data?.clubs || [];
    return dedupeClubs(clubs);
  },
  getClubById: (clubId) => request(`/clubs/${clubId}`),
  addClubMembers: (clubId, payload) => request(`/clubs/${clubId}/members`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getJoinConfirmation: (requestId) => request(`/join-requests/${requestId}/confirmation`),
  getEvents: () => request('/events'),
  getExecutiveDashboard: () => request('/executive/dashboard'),
  getExecutiveEvents: () => request('/executive/events'),
  publishEvent: (eventId, payload) => request(`/executive/events/${eventId}/publish`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  postAnnouncement: (payload) => request('/executive/announcements', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateUserRole: (userId, payload) => request(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  approveClub: (clubId, payload) => request(`/admin/clubs/${clubId}/approve`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
};
