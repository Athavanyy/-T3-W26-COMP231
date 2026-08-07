const ClubService = require("../services/clubService");
const EventService = require("../services/eventService");
const MembershipService = require("../services/membershipService");
const AnnouncementService = require("../services/announcementService");
const { clubValidation } = require("../validators");
const db = require("../config/database");

class ClubExecutiveController {
  //CLUB MANAGEMENT
  async getMyClub(req, res) {
    try {
      const clubs = await ClubService.getMyClubs(req.user.user_id);
      res.status(200).json({ success: true, data: clubs });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateClubProfile(req, res) {
    try {
      const { error } = clubValidation.update.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const { clubId } = req.params;

      const club = clubId
        ? await ClubService.updateClubProfileById(
            req.user.user_id,
            clubId,
            req.body,
          )
        : await ClubService.updateClubProfile(req.user.user_id, req.body);

      res.status(200).json({
        success: true,
        message: "Club profile updated successfully",
        data: club,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  //MEMBERSHIP MANAGEMENT
  async getMembers(req, res) {
    try {
      const members = await MembershipService.getMembers(req.user.user_id);
      res.status(200).json({ success: true, data: members });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getPendingRequests(req, res) {
    try {
      const requests = await MembershipService.getPendingRequests(
        req.user.user_id,
      );
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async approveJoinRequest(req, res) {
    try {
      const { requestId } = req.body;
      const result = await MembershipService.approveJoinRequest(
        req.user.user_id,
        requestId,
      );
      res.status(200).json({
        success: true,
        message: "Join request approved",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectJoinRequest(req, res) {
    try {
      const { requestId } = req.body;
      const result = await MembershipService.rejectJoinRequest(
        req.user.user_id,
        requestId,
      );
      res.status(200).json({
        success: true,
        message: "Join request rejected",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { membershipId } = req.body;
      const result = await MembershipService.removeMember(
        req.user.user_id,
        membershipId,
      );
      res
        .status(200)
        .json({ success: true, message: "Member removed", data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //EVENT MANAGEMENT
  async getMyEvents(req, res) {
    try {
      const events = await EventService.getClubEvents(req.user.user_id);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async createEvent(req, res) {
    try {
      const event = await EventService.createEvent(req.user.user_id, req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.updateEvent(
        req.user.user_id,
        eventId,
        req.body,
      );
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publishEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.publishEvent(req.user.user_id, eventId);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const result = await EventService.deleteEvent(req.user.user_id, eventId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getEventRegistrations(req, res) {
    try {
      const { eventId } = req.params;
      const regs = await EventService.getEventRegistrations(
        req.user.user_id,
        eventId,
      );
      res.status(200).json({ success: true, data: regs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllEventRegistrations(req, res) {
    try {
      const events = await EventService.getExecutiveEventList(req.user.user_id);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async exportRegistrations(req, res) {
    try {
      const { eventId } = req.params;
      const data = await EventService.exportRegistrations(req.user.user_id, eventId);
    
      if (data.registrations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No registrations found for this event'
        });
      }

      // Generate CSV
      let csv = `Event: ${data.eventName}\n\n`;
      csv += `"Name","Email","Registered At"\n`;
    
      data.registrations.forEach(row => {
        const values = [
          `"${String(row.name || '').replace(/"/g, '""')}"`,
          `"${String(row.email || '').replace(/"/g, '""')}"`,
          `"${String(row.registeredAt || '').replace(/"/g, '""')}"`
        ];
        csv += values.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${data.eventName.replace(/[^a-zA-Z0-9]/g, '_')}_registrations_${new Date().toISOString().slice(0,10)}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  //ANNOUNCEMENT MANAGEMENT
  async getMyAnnouncements(req, res) {
    try {
      const anns = await AnnouncementService.getMyAnnouncements(
        req.user.user_id,
      );
      res.status(200).json({ success: true, data: anns });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async createAnnouncement(req, res) {
    try {
      const ann = await AnnouncementService.createAnnouncement(
        req.user.user_id,
        req.body,
      );
      res.status(201).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publishAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.publishAnnouncement(
        req.user.user_id,
        announcementId,
      );
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.updateAnnouncement(
        req.user.user_id,
        announcementId,
        req.body,
      );
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
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

module.exports = new ClubExecutiveController();
