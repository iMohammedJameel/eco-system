const Joi = require("joi");

const depositSchema = Joi.object({
  qrToken: Joi.string().required(),
  materialType: Joi.string().valid("plastic", "glass", "cardboard", "paper").required(),
  // نفس حد الـ PWA (500 كجم) — بدونه يقدر يبعت أرقام فلكية
  weightKg: Joi.number().positive().max(500).required(),
  itemsCount: Joi.number().integer().min(0).optional(),
});

const withdrawSchema = Joi.object({
  amount: Joi.number().min(10).required(),
  withdrawalMethod: Joi.string().valid("bank", "mobile_wallet", "coupon").required(),
  accountNumber: Joi.string().required(),
});

const qrSessionSchema = Joi.object({
  machineId: Joi.string().required(),
});

// مطالبة إيداع عامة (PWA) — رقم تليفون مصري
const publicClaimSchema = Joi.object({
  qrToken: Joi.string().hex().length(32).required(),
  phoneNumber: Joi.string()
    .pattern(/^(\+?2)?01[0-25]\d{8}$/)
    .required()
    .messages({ "string.pattern.base": "Invalid Egyptian phone number" }),
  materialType: Joi.string().valid("plastic", "glass", "cardboard", "paper").required(),
  weightKg: Joi.number().positive().max(500).required(),
  username: Joi.string().trim().min(2).max(60).optional(),
});

module.exports = { depositSchema, withdrawSchema, qrSessionSchema, publicClaimSchema };
