const Joi = require("joi");

const coordinatesSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
});

const createMachineSchema = Joi.object({
  name: Joi.string().min(3).required(),
  location: Joi.string().required(),
  governorate: Joi.string().required(),
  coordinates: coordinatesSchema.optional(),
});

const updateMachineSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  location: Joi.string().optional(),
  governorate: Joi.string().optional(),
  status: Joi.string().valid("active", "nearlyFull", "offline").optional(),
  fillPercentage: Joi.number().min(0).max(100).optional(),
  coordinates: coordinatesSchema.optional(),
});

module.exports = { createMachineSchema, updateMachineSchema };
