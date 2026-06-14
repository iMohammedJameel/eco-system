// Require Joi
const Joi = require("joi");

// Register Schema
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Export
module.exports = { registerSchema, loginSchema };
