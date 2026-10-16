const Joi = require("joi");

const issueCouponSchema = Joi.object({
  userId: Joi.string().hex().length(24).required().messages({
    "string.length": "userId must be a valid id",
  }),
  partnerId: Joi.string().hex().length(24).required().messages({
    "string.length": "partnerId must be a valid id",
  }),
  offerTitle: Joi.string().trim().max(120).optional().allow('', null),
  pointsCost: Joi.number().integer().min(1).max(100000).required(),
  validityDays: Joi.number().integer().min(1).max(365).optional(),
});

module.exports = { issueCouponSchema };
