const Joi = require("joi");

const createAchievementSchema = Joi.object({
  name: Joi.string().min(3).max(80).required(),
  description: Joi.string().max(280).optional().allow(""),
  icon: Joi.string().max(20).optional(),
  metric: Joi.string()
    .valid("totalDeposits", "depositsCount", "balance", "co2Saved")
    .required(),
  threshold: Joi.number().min(0).required(),
  xpReward: Joi.number().min(0).optional(),
  badgeColor: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

const updateAchievementSchema = Joi.object({
  name: Joi.string().min(3).max(80).optional(),
  description: Joi.string().max(280).optional().allow(""),
  icon: Joi.string().max(20).optional(),
  metric: Joi.string()
    .valid("totalDeposits", "depositsCount", "balance", "co2Saved")
    .optional(),
  threshold: Joi.number().min(0).optional(),
  xpReward: Joi.number().min(0).optional(),
  badgeColor: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { createAchievementSchema, updateAchievementSchema };
