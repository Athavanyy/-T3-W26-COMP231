const ClubService = require('../services/clubService');
const EventService = require('../services/eventService');
const MembershipService = require('../services/membershipService');
const AnnouncementService = require('../services/announcementService');

class ClubExecutiveController {
  // Club
  async getMyClub(req, res) {
    try {
      const club = await ClubService.getMyClub(req.user.id);
      res.status(200).json({ success: true, data: club });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateClubProfile(req, res) {
    try {
      const club = await ClubService.updateClubProfile(req.user.id, req.body);
      res.status(200).json({ success: true, data: club });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Members
  async getMembers(req, res) {
    try {
      const members = await MembershipService.getMembers(req.user.id);
      res.status(200).json({ success: true, data: members });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getPendingRequests(req, res) {
    try {
      const requests = await MembershipService.getPendingRequests(req.user.id);
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async approveJoinRequest(req, res) {
    try {
      const { membershipId } = req.body;
      const result = await MembershipService.approveJoinRequest(req.user.id, membershipId);
      res.status(200).json({ success: true, message: 'Approved', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async rejectJoinRequest(req, res) {
    try {
      const { membershipId } = req.body;
      const result = await MembershipService.rejectJoinRequest(req.user.id, membershipId);
      res.status(200).json({ success: true, message: 'Rejected', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { membershipId } = req.body;
      const result = await MembershipService.removeMember(req.user.id, membershipId);
      res.status(200).json({ success: true, message: 'Removed', data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Events
  async getMyEvents(req, res) {
    try {
      const events = await EventService.getClubEvents(req.user.id);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async createEvent(req, res) {
    try {
      const event = await EventService.createEvent(req.user.id, req.body);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.updateEvent(req.user.id, eventId, req.body);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publishEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.publishEvent(req.user.id, eventId);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const result = await EventService.deleteEvent(req.user.id, eventId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getEventRegistrations(req, res) {
    try {
      const { eventId } = req.params;
      const regs = await EventService.getEventRegistrations(req.user.id, eventId);
      res.status(200).json({ success: true, data: regs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllEventRegistrations(req, res) {
    try {
      const events = await EventService.getExecutiveEventList(req.user.id);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async exportRegistrations(req, res) {
    try {
      const { eventId } = req.params;
      const data = await EventService.exportRegistrations(req.user.id, eventId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Announcements
  async getMyAnnouncements(req, res) {
    try {
      const anns = await AnnouncementService.getMyAnnouncements(req.user.id);
      res.status(200).json({ success: true, data: anns });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async createAnnouncement(req, res) {
    try {
      const ann = await AnnouncementService.createAnnouncement(req.user.id, req.body);
      res.status(201).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publishAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.publishAnnouncement(req.user.id, announcementId);
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const ann = await AnnouncementService.updateAnnouncement(req.user.id, announcementId, req.body);
      res.status(200).json({ success: true, data: ann });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ClubExecutiveController();