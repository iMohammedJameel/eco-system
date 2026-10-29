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

// تعديل جزئي لعرض واحد (PATCH) — كل الحقول اختيارية عدا القيمة
const updateDiscountOfferSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  discountType: Joi.string().valid("percentage", "fixed").optional(),
  discountValue: Joi.number().min(0).optional(),
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
  // كلمة مرور بوابة الشركاء — يضبطها الأدمن عند إنشاء/تحديث الشريك
  password: Joi.string().min(6).optional(),
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
  password: Joi.string().min(6).optional(),
  discountOffers: Joi.array().items(discountOfferSchema).optional(),
  isActive: Joi.boolean().optional(),
});

// تسجيل دخول الشريك — بوابة الشركاء
const partnerLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  remember: Joi.boolean().optional(),
});

module.exports = {
  createPartnerSchema,
  updatePartnerSchema,
  discountOfferSchema,
  updateDiscountOfferSchema,
  partnerLoginSchema,
};
