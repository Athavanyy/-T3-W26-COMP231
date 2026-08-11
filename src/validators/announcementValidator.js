const Joi = require('joi');

const announcementValidation = {
  announcement: Joi.object({
    title: Joi.string().trim().min(1).max(100).required(),
    message: Joi.string().trim().min(1).max(5000).required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'REMOVED').required()
  })
};

module.exports = announcementValidation;