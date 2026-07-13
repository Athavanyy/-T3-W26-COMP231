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

export const api = {
  getClubs: () => request('/clubs'),
  getClubById: (clubId) => request(`/clubs/${clubId}`),
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
