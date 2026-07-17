const { memberships, users, clubs, ActivityLog } = require('./mockData');

class MembershipService {
  static async submitJoinRequest(studentId, clubId) {
    const existing = memberships.find(m => m.userId === studentId && m.clubId === clubId && (m.status === 'pending' || m.status === 'active'));
    if (existing) throw new Error('Request already exists');
    const newM = { id: memberships.length + 1, userId: studentId, clubId, status: 'pending', joinedAt: null };
    memberships.push(newM);
    return newM;
  }

  static async getPendingRequests(executiveId) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    return memberships.filter(m => m.clubId === club.id && m.status === 'pending');
  }

  static async getMembers(executiveId) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    return memberships.filter(m => m.clubId === club.id && m.status === 'active');
  }

  static async approveJoinRequest(executiveId, membershipId) {
    const mem = memberships.find(m => m.id === membershipId);
    if (!mem) throw new Error('Not found');
    mem.status = 'active';
    mem.joinedAt = new Date();
    return mem;
  }

  static async rejectJoinRequest(executiveId, membershipId) {
    const mem = memberships.find(m => m.id === membershipId);
    if (!mem) throw new Error('Not found');
    mem.status = 'rejected';
    return mem;
  }

  static async removeMember(executiveId, membershipId) {
    const mem = memberships.find(m => m.id === membershipId);
    if (!mem) throw new Error('Not found');
    mem.status = 'inactive';
    mem.leftAt = new Date();
    return mem;
  }

  static async getMembershipHistory(executiveId) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    return memberships.filter(m => m.clubId === club.id);
  }
}

module.exports = MembershipService;