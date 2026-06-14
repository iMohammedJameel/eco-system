// Require Joi
const Joi = require("joi");

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Export
module.exports = loginSchema;
