const Joi = require('joi');

const eventValidation = {
  event: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    eventDate: Joi.date().greater('now').required(),
    eventTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    location: Joi.string().min(3).max(200).required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED').required()
  }),

  search: Joi.object({
    keyword: Joi.string().optional(),
    clubId: Joi.number().integer().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED').optional()
  })
};

module.exports = eventValidation;