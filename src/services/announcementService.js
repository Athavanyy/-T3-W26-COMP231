const { announcements, clubs, users, ActivityLog } = require('./mockData');

class AnnouncementService {
  static async getAnnouncements(studentId) {
    return announcements.filter(a => a.status === 'published');
  }

  static async getAnnouncementDetails(announcementId) {
    const ann = announcements.find(a => a.id === parseInt(announcementId));
    if (!ann) throw new Error('Not found');
    if (ann.status !== 'published') throw new Error('Not available');
    return ann;
  }

  static async createAnnouncement(executiveId, announcementData) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    const newAnn = { id: announcements.length + 1, ...announcementData, clubId: club.id, authorId: executiveId, status: 'draft' };
    announcements.push(newAnn);
    return newAnn;
  }

  static async publishAnnouncement(executiveId, announcementId) {
    const ann = announcements.find(a => a.id === parseInt(announcementId));
    if (!ann) throw new Error('Not found');
    ann.status = 'published';
    ann.publishedAt = new Date();
    return ann;
  }

  static async updateAnnouncement(executiveId, announcementId, updateData) {
    const ann = announcements.find(a => a.id === parseInt(announcementId));
    if (!ann) throw new Error('Not found');
    Object.assign(ann, updateData);
    return ann;
  }

  static async getMyAnnouncements(executiveId) {
    const club = clubs.find(c => c.executiveId === executiveId);
    if (!club) throw new Error('No club assigned');
    return announcements.filter(a => a.clubId === club.id);
  }

  static async getAllAnnouncements() {
    return announcements;
  }

  static async removeAnnouncement(adminId, announcementId) {
    const ann = announcements.find(a => a.id === parseInt(announcementId));
    if (!ann) throw new Error('Not found');
    ann.status = 'removed';
    return { message: 'Removed' };
  }
}

module.exports = AnnouncementService;