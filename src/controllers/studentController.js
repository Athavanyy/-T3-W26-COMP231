const ClubService = require('../services/clubService');
const EventService = require('../services/eventService');
const MembershipService = require('../services/membershipService');
const AnnouncementService = require('../services/announcementService');

class StudentController {
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

}

module.exports = new StudentController();