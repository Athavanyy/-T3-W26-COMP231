const express = require("express");
const router = express.Router();
const clubExecutiveController = require("../controllers/clubExecutiveController");
const authenticate = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const validate = require("../middleware/validation");
const {
  clubValidation,
  eventValidation,
  announcementValidation,
} = require("../validators");

router.use(authenticate);
router.use(roleCheck("CLUB_EXECUTIVE")); 

router.get("/club", clubExecutiveController.getMyClub);
router.put(
  "/club",
  validate(clubValidation.update),
  clubExecutiveController.updateClubProfile,
);
router.put(
  "/club/:clubId",
  validate(clubValidation.update),
  clubExecutiveController.updateClubProfile,
);

router.get(
  "/members/history",
  clubExecutiveController.getMembershipHistory
);
router.get("/members", clubExecutiveController.getMembers);
router.get("/members/requests", clubExecutiveController.getPendingRequests);
router.put("/members/approve", clubExecutiveController.approveJoinRequest);
router.put("/members/reject", clubExecutiveController.rejectJoinRequest);
router.delete("/members/remove", clubExecutiveController.removeMember);

router.get("/events", clubExecutiveController.getMyEvents);
router.post(
  "/events",
  validate(eventValidation.event),
  clubExecutiveController.createEvent,
);
router.put(
  "/events/:eventId",
  validate(eventValidation.event),
  clubExecutiveController.updateEvent,
);
router.put("/events/:eventId/publish", clubExecutiveController.publishEvent);
router.delete("/events/:eventId", clubExecutiveController.deleteEvent);
router.get(
  "/events/:eventId/registrations",
  clubExecutiveController.getEventRegistrations,
);
router.get("/registrations", clubExecutiveController.getAllEventRegistrations);
router.get(
  "/registrations/:eventId/export",
  clubExecutiveController.exportRegistrations,
);

router.get("/announcements", clubExecutiveController.getMyAnnouncements);
router.post(
  "/announcements",
  validate(announcementValidation.announcement),
  clubExecutiveController.createAnnouncement,
);
router.put(
  "/announcements/:announcementId/publish",
  clubExecutiveController.publishAnnouncement,
);
router.put(
  "/announcements/:announcementId",
  validate(announcementValidation.announcement),
  clubExecutiveController.updateAnnouncement,
);

module.exports = router;
