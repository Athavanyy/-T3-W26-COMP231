const Joi = require('joi');

const announcementValidation = {
  announcement: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    content: Joi.string().min(10).max(5000).required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('draft', 'published', 'removed').required()
  })
};

module.exports = announcementValidation;