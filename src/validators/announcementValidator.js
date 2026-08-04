const Joi = require("joi");

const announcementValidation = {
  announcement: Joi.object({
    clubId: Joi.number().integer().optional(),
    title: Joi.string().min(3).max(100).required(),
    message: Joi.string().min(10).max(5000).required(),
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid("DRAFT", "PUBLISHED", "REMOVED").required(),
  }),
};

module.exports = announcementValidation;
