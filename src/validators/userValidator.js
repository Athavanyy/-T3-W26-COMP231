const Joi = require('joi');

const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    studentId: Joi.string().optional(),
    role: Joi.string().valid('student', 'club_executive', 'administrator').default('student')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    studentId: Joi.string(),
    preferences: Joi.object()
  }),

  updateRole: Joi.object({
    role: Joi.string().valid('student', 'club_executive', 'administrator').required()
  }),

  addUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    role: Joi.string().valid('student', 'club_executive', 'administrator').required(),
    studentId: Joi.string().optional()
  })
};

module.exports = userValidation;