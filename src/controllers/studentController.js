const ClubService = require('../services/clubService');
const EventService = require('../services/eventService');
const MembershipService = require('../services/membershipService');
const AnnouncementService = require('../services/announcementService');
const AuthService = require('../services/authService');
const { userValidation } = require('../validators');
const NotificationService = require('../services/notificationService');
const db = require('../config/database');

class StudentController {
  async getProfile(req, res) {
    try {
      const userId = req.user.id || req.user.user_id;
      const user = await AuthService.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { error } = userValidation.updateProfile.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const userId = req.user.id || req.user.user_id;
      const updatedUser = await AuthService.updateUserProfile(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Clubs
  async browseClubs(req, res) {
    try {
      const { keyword, category } = req.query;
      const clubs = await ClubService.browseClubs({ keyword, category });
      res.status(200).json({ success: true, data: clubs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getClubDetails(req, res) {
    try {
      const { clubId } = req.params;
      const club = await ClubService.getClubDetails(clubId);
      res.status(200).json({ success: true, data: club });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getClubCategories(req, res) {
    try {
      const categories = await ClubService.getClubCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async saveFavouriteClub(req, res) {
    try {
      const { clubId } = req.body;

      if (!clubId) {
        return res.status(400).json({
          success: false,
          message: "Club ID is required"
        });
      }

      const favourite = await ClubService.saveFavouriteClub(
        req.user.id,
        Number(clubId)
      );

      res.status(201).json({
        success: true,
        message: "Club saved as favourite",
        data: favourite
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getFavouriteClubs(req, res) {
    try {
      const favourites = await ClubService.getFavouriteClubs(req.user.id);

      res.status(200).json({
        success: true,
        data: favourites
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }



  // Membership
  async submitJoinRequest(req, res) {
    try {
      const { clubId } = req.body;
      const result = await MembershipService.submitJoinRequest(req.user.id, clubId);
      res.status(201).json({ success: true, message: 'Request submitted', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Events
  async browseEvents(req, res) {
    try {
      const { keyword, clubId, category, dateFrom, dateTo } = req.query;
      const events = await EventService.browseEvents({ keyword, clubId, category, dateFrom, dateTo });
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getEventDetails(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.getEventDetails(eventId);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async registerForEvent(req, res) {
    try {
      const { eventId } = req.body;
      const result = await EventService.registerForEvent(req.user.id, eventId);
      res.status(201).json({ success: true, message: 'Registered successfully', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Announcements
  async getAnnouncements(req, res) {
    try {
      const announcements = await AnnouncementService.getAnnouncements(req.user.id);
      res.status(200).json({ success: true, data: announcements });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAnnouncementDetails(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.getAnnouncementDetails(announcementId);
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getNotificationPreferences(req, res) {
    try {
      const preferences =
        await NotificationService.getStudentPreferences(req.user.id);

      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateNotificationPreference(req, res) {
    try {
      const { clubId } = req.params;
      const { emailEnabled } = req.body;

      if (typeof emailEnabled !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "emailEnabled must be true or false",
        });
      }

      const preference =
        await NotificationService.updatePreference(
          req.user.id,
          Number(clubId),
          emailEnabled,
        );

      res.status(200).json({
        success: true,
        message: emailEnabled
          ? "Email notifications enabled"
          : "Email notifications disabled",
        data: preference,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getTheme(req, res) {
    try {
      const [rows] = await db.query(
        "SELECT visual_theme FROM users WHERE user_id = ?",
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        data: { theme: rows[0].visual_theme }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateTheme(req, res) {
    try {
      const { theme } = req.body;

      if (!["light", "dark"].includes(theme)) {
        return res.status(400).json({
          success: false,
          message: "Invalid theme"
        });
      }

      const [result] = await db.query(
        "UPDATE users SET visual_theme = ? WHERE user_id = ?",
        [theme, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Read it back from the database
      const [rows] = await db.query(
        "SELECT visual_theme FROM users WHERE user_id = ?",
        [req.user.id]
      );

      res.status(200).json({
        success: true,
        message: "Theme preference saved",
        data: {
          visual_theme: rows[0].visual_theme
        }
      });

    } catch (error) {
      console.error("Theme update error:", error);

      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new StudentController();