const Joi = require("joi");

const createPricingSchema = Joi.object({
  materialType: Joi.string().valid("plastic", "glass", "cardboard", "paper").required(),
  pricePerKg: Joi.number().min(0).required(),
  currency: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

const updatePricingSchema = Joi.object({
  pricePerKg: Joi.number().min(0).optional(),
  currency: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { createPricingSchema, updatePricingSchema };
