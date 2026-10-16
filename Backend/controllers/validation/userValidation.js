// Require Joi
const Joi = require("joi");

// Create User Schema
const createUserSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

// Update User Schema
const updateUserSchema = Joi.object({
  username: Joi.string().min(3).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// Export
module.exports = { createUserSchema, updateUserSchema };
