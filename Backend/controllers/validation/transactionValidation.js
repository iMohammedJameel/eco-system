const Joi = require("joi");

const depositSchema = Joi.object({
  qrToken: Joi.string().required(),
  materialType: Joi.string().valid("plastic", "glass", "cardboard", "paper").required(),
  weightKg: Joi.number().positive().required(),
  itemsCount: Joi.number().integer().min(0).optional(),
});

const withdrawSchema = Joi.object({
  amount: Joi.number().min(10).required(),
  withdrawalMethod: Joi.string().valid("bank", "mobile_wallet").required(),
  accountNumber: Joi.string().required(),
});

const qrSessionSchema = Joi.object({
  machineId: Joi.string().required(),
});

module.exports = { depositSchema, withdrawSchema, qrSessionSchema };
