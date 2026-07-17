const { events, clubs, registrations, users, ActivityLog } = require('./mockData');

class EventService {
  static async browseEvents(filters = {}) {
    let filtered = events.filter(e => e.status === 'published');
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(kw));
    }
    if (filters.clubId) filtered = filtered.filter(e => e.clubId === parseInt(filters.clubId));
    return filtered;
  }

  static async getEventDetails(eventId) {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) throw new Error('Event not found');
    if (event.status !== 'published') throw new Error('Event not available');
    const club = clubs.find(c => c.id === event.clubId);
    return { ...event, Club: club };
  }

  static async createEvent(executiveId, eventData) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    const newEvent = { id: events.length + 1, ...eventData, clubId: club.id, status: 'draft' };
    events.push(newEvent);
    return newEvent;
  }

  static async updateEvent(executiveId, eventId, updateData) {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) throw new Error('Event not found');
    Object.assign(event, updateData);
    return event;
  }

  static async publishEvent(executiveId, eventId) {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) throw new Error('Event not found');
    if (event.status !== 'draft') throw new Error('Not draft');
    event.status = 'published';
    return event;
  }

  static async deleteEvent(executiveId, eventId) {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) throw new Error('Event not found');
    event.status = 'cancelled';
    return { message: 'Event cancelled' };
  }

  static async getClubEvents(executiveId) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    return events.filter(e => e.clubId === club.id);
  }

  static async registerForEvent(studentId, eventId) {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) throw new Error('Event not found');
    if (event.status !== 'published') throw new Error('Not open');
    const existing = registrations.find(r => r.userId === studentId && r.eventId === parseInt(eventId) && r.status === 'registered');
    if (existing) throw new Error('Already registered');
    const newReg = { id: registrations.length + 1, userId: studentId, eventId: parseInt(eventId), status: 'registered', registeredAt: new Date() };
    registrations.push(newReg);
    return newReg;
  }

  static async getEventRegistrations(executiveId, eventId) {
    const event = events.find(e => e.id === parseInt(eventId));
    if (!event) throw new Error('Event not found');
    return registrations.filter(r => r.eventId === parseInt(eventId) && r.status === 'registered');
  }

  static async getExecutiveEventList(executiveId) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    return events.filter(e => e.clubId === club.id);
  }

  static async exportRegistrations(executiveId, eventId) {
    const regs = await this.getEventRegistrations(executiveId, eventId);
    return regs.map((r, idx) => ({ name: `Student ${idx}`, email: `student${idx}@test.com`, studentId: `S${idx}` }));
  }
}

module.exports = EventService;