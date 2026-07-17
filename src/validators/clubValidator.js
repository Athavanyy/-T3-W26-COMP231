const Joi = require('joi');

const clubValidation = {
  club: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    category: Joi.string().min(2).max(50).required(),
    meetingDay: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').optional().allow(null, ''),
    meetingTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().allow(null, ''),
    meetingLocation: Joi.string().max(200).optional().allow(null, '')
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'active', 'inactive').required()
  }),

  search: Joi.object({
    keyword: Joi.string().min(1).max(100).optional(),
    category: Joi.string().optional(),
    status: Joi.string().valid('active', 'pending', 'inactive').optional()
  })
};

module.exports = clubValidation;