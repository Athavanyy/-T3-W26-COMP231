const Joi = require('joi');

const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('STUDENT', 'CLUB_EXECUTIVE', 'ADMIN').default('STUDENT')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(1).max(100).required(),
    email: Joi.string().email().required()
  }),

  updateRole: Joi.object({
    role: Joi.string().valid('STUDENT', 'CLUB_EXECUTIVE', 'ADMIN').required()
  }),

  addUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    fullName: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('STUDENT', 'CLUB_EXECUTIVE', 'ADMIN').required(),
    studentId: Joi.string().optional()
  })
};

module.exports = userValidation;