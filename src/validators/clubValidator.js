const Joi = require('joi');

const clubValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    category: Joi.string().min(2).max(50).required(),
    meeting_details: Joi.string().max(255).optional().allow(null, '')
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(2000).optional(),
    category: Joi.string().min(2).max(50).optional(),
    meeting_details: Joi.string().max(255).optional().allow(null, '')
  }).min(1),

  updateStatus: Joi.object({
    status: Joi.string().valid('PENDING', 'ACTIVE', 'INACTIVE').required()
  }),

  search: Joi.object({
    keyword: Joi.string().min(1).max(100).optional(),
    category: Joi.string().optional(),
    status: Joi.string().valid('PENDING', 'ACTIVE', 'INACTIVE').optional()
  })
};

module.exports = clubValidation;