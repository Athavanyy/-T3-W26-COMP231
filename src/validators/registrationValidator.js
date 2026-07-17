const Joi = require('joi');

const registrationValidation = {
  registration: Joi.object({
    eventId: Joi.number().integer().required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('registered', 'cancelled', 'attended').required()
  }),

  joinRequest: Joi.object({
    clubId: Joi.number().integer().required()
  }),

  requestAction: Joi.object({
    membershipId: Joi.number().integer().required(),
    action: Joi.string().valid('approve', 'reject').required()
  })
};

module.exports = registrationValidation;