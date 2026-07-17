const Joi = require('joi');

const eventValidation = {
  event: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    date: Joi.date().greater('now').required(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    location: Joi.string().min(3).max(200).required(),
    maxParticipants: Joi.number().integer().min(1).optional()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').required()
  }),

  search: Joi.object({
    keyword: Joi.string().optional(),
    clubId: Joi.number().integer().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    status: Joi.string().valid('draft', 'published', 'cancelled', 'completed').optional()
  })
};

module.exports = eventValidation;