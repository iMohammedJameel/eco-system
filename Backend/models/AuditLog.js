/**
 * Audit Log — سجل تدقيق لكل عمليات الأدمن الحساسة
 * يسجل: مين عمل إيه، على أي هدف، إمتى، من أي IP
 */
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      name: { type: String, default: "—" },
      role: { type: String, default: "system" },
    },
    // نوع العملية: user.delete / machine.create / coupon.issue ...
    action: {
      type: String,
      required: [true, "Action is Required"],
      trim: true,
    },
    targetType: {
      type: String,
      enum: [
        "user", "machine", "pricing", "partner", "coupon",
        "achievement", "notification", "issue", "admin", "auth", "system",
      ],
      default: "system",
    },
    targetId: { type: String, default: null },
    targetLabel: { type: String, default: "—" },
    // ملخص التغييرات (before/after مختصر)
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true },
);

// فهارس للفلترة السريعة
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ "actor.id": 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
