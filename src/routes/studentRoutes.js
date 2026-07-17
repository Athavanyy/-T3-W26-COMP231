const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validation');
const { registrationValidation } = require('../validators');

router.use(authenticate);
router.use(roleCheck('student'));

// Clubs
router.get('/clubs', studentController.browseClubs);
router.get('/clubs/categories', studentController.getClubCategories);
router.get('/clubs/:clubId', studentController.getClubDetails);

// Membership
router.post('/membership/join', validate(registrationValidation.joinRequest), studentController.submitJoinRequest);

// Events
router.get('/events', studentController.browseEvents);
router.get('/events/:eventId', studentController.getEventDetails);
router.post('/events/register', validate(registrationValidation.registration), studentController.registerForEvent);

// Announcements
router.get('/announcements', studentController.getAnnouncements);
router.get('/announcements/:announcementId', studentController.getAnnouncementDetails);

module.exports = router;