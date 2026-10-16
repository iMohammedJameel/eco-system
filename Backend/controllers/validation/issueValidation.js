const Joi = require("joi");

const createIssueSchema = Joi.object({
  machine: Joi.string().hex().length(24).required(),
  type: Joi.string()
    .valid("broken", "full", "jammed", "dirty", "rejected_item", "other")
    .required(),
  description: Joi.string().max(1000).optional().allow(""),
  priority: Joi.string().valid("low", "medium", "high").optional(),
});

const updateIssueSchema = Joi.object({
  status: Joi.string()
    .valid("open", "in_progress", "resolved", "dismissed")
    .optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
  adminNotes: Joi.string().max(1000).optional().allow(""),
});

module.exports = { createIssueSchema, updateIssueSchema };
