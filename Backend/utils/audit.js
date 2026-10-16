/**
 * Audit helper — يسجل عمليات الأدمن في AuditLog
 * fire-and-forget: لا يُفشل الطلب لو السجل وقع
 */
const AuditLog = require("../models/AuditLog");

const logAudit = (req, { action, targetType = "system", targetId = null, targetLabel = "—", meta = {}, actor = null }) => {
  Promise.resolve()
    .then(() =>
      AuditLog.create({
        actor: actor || {
          id: req.user?.id || null,
          name: req.user?.name || req.user?.username || "—",
          role: req.user?.role || "system",
        },
        action,
        targetType,
        targetId: targetId ? String(targetId) : null,
        targetLabel,
        meta,
        ip: req.ip || req.socket?.remoteAddress || null,
        userAgent: (req.headers["user-agent"] || "").slice(0, 250),
      }),
    )
    .catch((err) => console.error("AUDIT_LOG_ERROR:", err.message));
};

module.exports = { logAudit };
