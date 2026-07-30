const AdminService = require('../services/adminService');
const ClubService = require('../services/clubService');
const AnnouncementService = require('../services/announcementService');

class AdminController {
  // Users
  async getUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers(req.query);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await AdminService.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { userId } = req.params;
      const user = await AdminService.updateUserRole(req.user.id, userId, req.body.role);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async disableUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await AdminService.disableUser(req.user.id, userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async enableUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await AdminService.enableUser(req.user.id, userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Clubs (Admin)
  async getClubs(req, res) {
    try {
      const clubs = await ClubService.getAllClubs(req.query);
      res.status(200).json({ success: true, data: clubs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async approveClub(req, res) {
    try {
      const { clubId } = req.params;
      const club = await ClubService.approveClub(req.user.id, clubId);
      res.status(200).json({ success: true, data: club });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateClubStatus(req, res) {
    try {
      const { clubId } = req.params;
      const club = await ClubService.updateClubStatus(req.user.id, clubId, req.body.status);
      res.status(200).json({ success: true, data: club });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeClub(req, res) {
    try {
      const { clubId } = req.params;
      const result = await ClubService.removeClub(req.user.id, clubId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Activities
  async getRecentActivities(req, res) {
    try {
      const { limit } = req.query;
      const activities = await AdminService.getRecentActivities(limit || 100);
      res.status(200).json({ success: true, data: activities });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ===== ACTIVITY LOGGING =====

  async getActivityLogs(req, res) {
    try {
      const { userId, action, status, startDate, endDate } = req.query;
      const logs = await AdminService.getActivityLogs({
        userId,
        action,
        status,
        startDate,
        endDate
      });
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  async getFailedActivities(req, res) {
    try {
      const logs = await AdminService.getFailedActivities();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Reports
  async generateReport(req, res) {
    try {
      const { reportType, ...filters } = req.query;
      if (!reportType) return res.status(400).json({ success: false, message: 'Report type required' });
      const data = await AdminService.generateReport(reportType, filters);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Announcements (Admin)
  async getAllAnnouncements(req, res) {
    try {
      const anns = await AnnouncementService.getAllAnnouncements();
      res.status(200).json({ success: true, data: anns });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async removeAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const result = await AnnouncementService.removeAnnouncement(req.user.id, announcementId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllDatabaseData(req, res) {
    try {
      const data = await AdminService.getAllDatabaseData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

}

module.exports = new AdminController();