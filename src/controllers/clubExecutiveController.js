const ClubService = require('../services/clubService');
const EventService = require('../services/eventService');
const MembershipService = require('../services/membershipService');
const AnnouncementService = require('../services/announcementService');
const { clubValidation } = require('../validators');

class ClubExecutiveController {
  //CLUB MANAGEMENT
  async getMyClub(req, res) {
    try {
      const club = await ClubService.getMyClub(req.user.user_id); // ✅ Use user_id
      res.status(200).json({ success: true, data: club });
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
          message: error.details[0].message
        });
      }

      const club = await ClubService.updateClubProfile(req.user.user_id, req.body);
      res.status(200).json({
        success: true,
        message: 'Club profile updated successfully',
        data: club
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
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
      const requests = await MembershipService.getPendingRequests(req.user.user_id);
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async approveJoinRequest(req, res) {
    try {
      const { requestId } = req.body;
      const result = await MembershipService.approveJoinRequest(req.user.user_id, requestId);
      res.status(200).json({ success: true, message: 'Join request approved', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectJoinRequest(req, res) {
    try {
      const { requestId } = req.body;
      const result = await MembershipService.rejectJoinRequest(req.user.user_id, requestId);
      res.status(200).json({ success: true, message: 'Join request rejected', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { membershipId } = req.body;
      const result = await MembershipService.removeMember(req.user.user_id, membershipId);
      res.status(200).json({ success: true, message: 'Member removed', data: result });
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
      const event = await EventService.updateEvent(req.user.user_id, eventId, req.body);
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
      const regs = await EventService.getEventRegistrations(req.user.user_id, eventId);
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
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  //ANNOUNCEMENT MANAGEMENT
  async getMyAnnouncements(req, res) {
    try {
      const anns = await AnnouncementService.getMyAnnouncements(req.user.user_id);
      res.status(200).json({ success: true, data: anns });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async createAnnouncement(req, res) {
    try {
      const ann = await AnnouncementService.createAnnouncement(req.user.user_id, req.body);
      res.status(201).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publishAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.publishAnnouncement(req.user.user_id, announcementId);
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.updateAnnouncement(req.user.user_id, announcementId, req.body);
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ClubExecutiveController();