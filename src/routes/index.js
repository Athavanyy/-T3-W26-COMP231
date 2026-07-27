const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const clubExecutiveRoutes = require('./clubExecutiveRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/executive', clubExecutiveRoutes);
router.use('/admin', adminRoutes);

module.exports = router;