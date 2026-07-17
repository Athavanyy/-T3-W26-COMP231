// src/services/clubService.js
const { clubs, users } = require('./mockData');

class ClubService {
  static async browseClubs(filters = {}) {
    let filtered = clubs.filter(c => c.status === 'active');
    if (filters.category) filtered = filtered.filter(c => c.category === filters.category);
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw));
    }
    return filtered;
  }

  static async getClubDetails(clubId) {
    const club = clubs.find(c => c.id === parseInt(clubId));
    if (!club) throw new Error('Club not found');
    const executive = users.find(u => u.id === club.executiveId);
    return { ...club, executive };
  }

  static async getClubCategories() {
    return [...new Set(clubs.map(c => c.category))];
  }

  static async getMyClub(executiveId) {
    const club = clubs.find(c => c.executiveId === parseInt(executiveId));
    if (!club) throw new Error('You are not assigned to any club');
    return club;
  }

  static async updateClubProfile(executiveId, updateData) {
    const club = clubs.find(c => c.executiveId === parseInt(executiveId));
    if (!club) throw new Error('Club not found');
    Object.assign(club, updateData);
    return club;
  }

  static async getAllClubs(filters = {}) {
    let filtered = clubs;
    if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(kw));
    }
    return filtered;
  }

  static async approveClub(adminId, clubId) {
    const club = clubs.find(c => c.id === parseInt(clubId));
    if (!club) throw new Error('Club not found');
    if (club.status !== 'pending') throw new Error('Not pending');
    club.status = 'active';
    return club;
  }

  static async updateClubStatus(adminId, clubId, status) {
    const club = clubs.find(c => c.id === parseInt(clubId));
    if (!club) throw new Error('Club not found');
    club.status = status;
    return club;
  }

  static async removeClub(adminId, clubId) {
    const club = clubs.find(c => c.id === parseInt(clubId));
    if (!club) throw new Error('Club not found');
    club.status = 'inactive';
    return { message: 'Club removed successfully' };
  }
}

module.exports = ClubService;