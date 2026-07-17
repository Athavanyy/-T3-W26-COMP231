const { users, clubs, activityLogs, events, memberships, registrations } = require('./mockData');

class AdminService {
  static async getAllUsers(filters = {}) {
    let filtered = users.map(u => { const { password, ...rest } = u; return rest; });
    if (filters.role) filtered = filtered.filter(u => u.role === filters.role);
    if (filters.isActive !== undefined) filtered = filtered.filter(u => u.isActive === (filters.isActive === 'true'));
    return filtered;
  }

  static async getUserById(userId) {
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) throw new Error('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  static async updateUserRole(adminId, userId, newRole) {
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) throw new Error('User not found');
    user.role = newRole;
    const { password, ...rest } = user;
    return rest;
  }

  static async disableUser(adminId, userId) {
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) throw new Error('User not found');
    user.isActive = false;
    const { password, ...rest } = user;
    return rest;
  }

  static async enableUser(adminId, userId) {
    const user = users.find(u => u.id === parseInt(userId));
    if (!user) throw new Error('User not found');
    user.isActive = true;
    const { password, ...rest } = user;
    return rest;
  }

  static async getRecentActivities(limit = 100) {
    return activityLogs.slice(0, limit);
  }

  static async getActivityLogs(filters = {}) {
    let logs = activityLogs;
    if (filters.status) logs = logs.filter(l => l.status === filters.status);
    return logs;
  }

  static async getFailedActivities() {
    return activityLogs.filter(l => l.status === 'failure');
  }

  static async generateReport(reportType, filters = {}) {
    if (reportType === 'club_activity') {
      return clubs.map(c => ({ ...c, memberCount: memberships.filter(m => m.clubId === c.id && m.status === 'active').length }));
    }
    if (reportType === 'event_participation') {
      return events.map(e => ({ ...e, participantCount: registrations.filter(r => r.eventId === e.id && r.status === 'registered').length }));
    }
    if (reportType === 'user_engagement') {
      return users.map(u => ({ ...u, clubMemberships: memberships.filter(m => m.userId === u.id && m.status === 'active').length }));
    }
    return { message: 'Unknown report type' };
  }
}

module.exports = AdminService;