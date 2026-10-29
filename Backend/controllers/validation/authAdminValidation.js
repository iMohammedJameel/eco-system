const Joi = require("joi");

// Login Schema — remember يتحكم في مدة الجلسة (30 يومًا أو جلسة متصفح)
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  remember: Joi.boolean().optional(),
});

// استعادة كلمة المرور — البريد + بيانات التحقق (اسم مستخدم أو رقم هاتف)
const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
  verify: Joi.string().trim().min(2).max(100).required(),
});

// تعيين كلمة مرور جديدة برمز الاستعادة
const resetSchema = Joi.object({
  resetToken: Joi.string().min(20).required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { loginSchema, forgotSchema, resetSchema };
