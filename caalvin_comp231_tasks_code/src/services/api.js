import { mockClubs, mockDashboard, mockEvents, mockJoinRequests, mockManageUsers, mockDefaultUser } from './mockApi.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function normalizeClub(club) {
  if (!club) return null;
  return {
    ...club,
    id: club.id ?? club.club_id ?? club._id,
    name: club.name ?? club.club_name ?? club.clubName,
    category: club.category ?? 'General',
    description: club.description ?? '',
    status: club.status ?? 'Approved',
    members: club.members ?? club.memberCount ?? 0,
    meetingDetails: club.meetingDetails ?? club.meeting_details ?? ''
  };
}

function normalizeEvent(event) {
  if (!event) return null;
  return {
    ...event,
    id: event.id ?? event.event_id ?? event._id,
    title: event.title ?? 'Untitled Event',
    clubName: event.clubName ?? event.club_name ?? 'Club Event',
    date: event.date ?? event.event_date ?? '',
    location: event.location ?? event.event_location ?? '',
    status: event.status ?? 'Draft'
  };
}

function normalizeJoinRequest(request) {
  if (!request) return null;
  return {
    ...request,
    id: request.id ?? request.request_id ?? request._id,
    student: request.student ?? request.full_name ?? 'Student',
    email: request.email ?? '',
    club: request.club ?? request.club_name ?? 'Club',
    status: request.status ?? request.request_status ?? 'Pending',
    requestDate: request.requestDate ?? request.request_date ?? ''
  };
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id ?? user.user_id ?? user._id,
    name: user.name ?? user.full_name ?? user.fullName,
    role: user.role ?? 'Student',
    isDisabled: Boolean(user.isDisabled ?? user.disabled ?? user.status === 'INACTIVE' ?? user.status === 'DISABLED')
  };
}

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

async function requestWithFallback(path, options = {}, fallbackValue, mapper = (value) => value) {
  try {
    const data = await request(path, options);
    return mapper(data);
  } catch (error) {
    console.warn(`Backend request failed for ${path}; using mock data fallback.`, error);
    return mapper(fallbackValue);
  }
}

export const api = {
  login: (payload) => requestWithFallback('/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, mockDefaultUser, normalizeUser),

  getUsers: () => requestWithFallback('/users', {}, mockManageUsers, (data) => {
    const items = Array.isArray(data) ? data : data?.users || [];
    return items.map(normalizeUser);
  }),

  getClubs: () => requestWithFallback('/clubs', {}, mockClubs, (data) => {
    const items = Array.isArray(data) ? data : data?.clubs || [];
    return items.map(normalizeClub);
  }),

  getClubById: (clubId) => requestWithFallback(`/clubs/${clubId}`, {}, mockClubs[0], (data) => normalizeClub(data?.club || data || mockClubs[0])),

  getJoinConfirmation: (requestId) => requestWithFallback(`/join-requests/${requestId}/confirmation`, {}, {
    id: requestId,
    status: 'Submitted',
    message: 'Your join request was recorded.'
  }, (data) => ({
    ...data,
    id: data?.id ?? requestId,
    status: data?.status ?? 'Submitted',
    message: data?.message ?? 'Your join request was recorded.'
  })),

  getJoinRequests: () => requestWithFallback('/join-requests', {}, mockJoinRequests, (data) => {
    const items = Array.isArray(data) ? data : data?.requests || [];
    return items.map(normalizeJoinRequest);
  }),

  approveJoinRequest: (requestId) => requestWithFallback(`/join-requests/${requestId}/approve`, {
    method: 'PUT'
  }, { success: true }, (data) => data),

  rejectJoinRequest: (requestId) => requestWithFallback(`/join-requests/${requestId}/reject`, {
    method: 'PUT'
  }, { success: true }, (data) => data),

  getEvents: () => requestWithFallback('/events', {}, mockEvents, (data) => {
    const items = Array.isArray(data) ? data : data?.events || [];
    return items.map(normalizeEvent);
  }),

  getExecutiveDashboard: () => requestWithFallback('/executive/dashboard', {}, mockDashboard, (data) => data),
  getExecutiveEvents: () => requestWithFallback('/executive/events', {}, mockEvents, (data) => {
    const items = Array.isArray(data) ? data : data?.events || [];
    return items.map(normalizeEvent);
  }),

  publishEvent: (eventId, payload) => requestWithFallback(`/executive/events/${eventId}/publish`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, { success: true }, (data) => data),

  postAnnouncement: (payload) => requestWithFallback('/executive/announcements', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content ?? payload.message,
      clubId: payload.clubId || 1
    })
  }, { success: true }, (data) => data),

  updateUserRole: (userId, payload) => requestWithFallback(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, { success: true }, (data) => data),

  approveClub: (clubId, payload) => requestWithFallback(`/admin/clubs/${clubId}/approve`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }, { success: true }, (data) => data)
};
