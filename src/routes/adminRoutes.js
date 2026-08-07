const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validation');
const { userValidation, clubValidation } = require('../validators');

router.use(authenticate);
router.use(roleCheck('ADMIN'));

router.get('/all-data', adminController.getAllDatabaseData);

router.get('/users', adminController.getUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId/role', validate(userValidation.updateRole), adminController.updateUserRole);
router.put('/users/:userId/disable', adminController.disableUser);
router.put('/users/:userId/enable', adminController.enableUser);

router.get('/clubs', adminController.getClubs);
router.put('/clubs/:clubId/approve', adminController.approveClub);
router.put('/clubs/:clubId/status', validate(clubValidation.updateStatus), adminController.updateClubStatus);
router.delete('/clubs/:clubId', adminController.removeClub);

router.get('/activities/recent', adminController.getRecentActivities);
router.get('/activities/logs', adminController.getActivityLogs);
router.get('/activities/failed', adminController.getFailedActivities);

router.get('/reports/generate', adminController.generateReport);

router.get('/announcements', adminController.getAllAnnouncements);
router.delete('/announcements/:announcementId', adminController.removeAnnouncement);

router.get("/theme", adminController.getTheme);
router.put("/theme", adminController.updateTheme);

module.exports = router;