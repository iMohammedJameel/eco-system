const Joi = require("joi");

const createNotificationSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),
  message: Joi.string().min(3).max(1000).required(),
  type: Joi.string()
    .valid("earnings", "machine_alert", "promo", "system", "issue")
    .optional(),
  // "all" for broadcast, OR a valid ObjectId string for targeted user
  recipient: Joi.alternatives()
    .try(Joi.string().valid("all"), Joi.string().hex().length(24))
    .required(),
});

const updateNotificationSchema = Joi.object({
  title: Joi.string().min(3).max(120).optional(),
  message: Joi.string().min(3).max(1000).optional(),
  type: Joi.string()
    .valid("earnings", "machine_alert", "promo", "system", "issue")
    .optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { createNotificationSchema, updateNotificationSchema };
