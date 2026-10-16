const Joi = require("joi");

const discountOfferSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  discountType: Joi.string().valid("percentage", "fixed").optional(),
  discountValue: Joi.number().min(0).required(),
  minSpend: Joi.number().min(0).optional(),
  validUntil: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
});

const createPartnerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  category: Joi.string()
    .valid("supermarket", "electronics", "pharmacy", "fashion", "food", "services", "other")
    .optional(),
  logo: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().optional(),
  website: Joi.string().optional(),
  address: Joi.string().optional(),
  governorate: Joi.string().optional(),
  discountOffers: Joi.array().items(discountOfferSchema).optional(),
  isActive: Joi.boolean().optional(),
});

const updatePartnerSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  category: Joi.string()
    .valid("supermarket", "electronics", "pharmacy", "fashion", "food", "services", "other")
    .optional(),
  logo: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().optional(),
  website: Joi.string().optional(),
  address: Joi.string().optional(),
  governorate: Joi.string().optional(),
  discountOffers: Joi.array().items(discountOfferSchema).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { createPartnerSchema, updatePartnerSchema };
