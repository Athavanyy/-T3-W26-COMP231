const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validation');
const { registrationValidation } = require('../validators');

router.use(authenticate);
router.use(roleCheck('STUDENT'));

router.get('/clubs', studentController.browseClubs);
router.get('/clubs/categories', studentController.getClubCategories);
router.get('/clubs/:clubId', studentController.getClubDetails);

router.post('/membership/join', validate(registrationValidation.joinRequest), studentController.submitJoinRequest);

router.get('/events', studentController.browseEvents);
router.get('/events/:eventId', studentController.getEventDetails);
router.post('/events/register', validate(registrationValidation.registration), studentController.registerForEvent);


router.get('/notification-preferences', studentController.getNotificationPreferences,);

router.put("/notification-preferences/:clubId", studentController.updateNotificationPreference,);

router.get('/announcements', studentController.getAnnouncements);
router.get('/announcements/:announcementId', studentController.getAnnouncementDetails);

module.exports = router;