const Joi = require("joi");

// رقم موبايل مصري — 11 رقمًا يبدأ بـ 01 ثم 0/1/2/5 (مع بادئة دولية اختيارية)
const EGYPT_PHONE = /^(\+?2)?01[0-25]\d{8}$/;

// Register Schema
const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(60).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().trim().pattern(EGYPT_PHONE).required(),
  password: Joi.string().min(6).max(72).required(),
});

// Login Schema — remember يتحكم في مدة الجلسة (30 يومًا أو جلسة متصفح)
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  remember: Joi.boolean().optional(),
});

// Export
module.exports = { registerSchema, loginSchema };
