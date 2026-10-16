const AuditLog = require("../models/AuditLog");
const asyncWrapper = require("../middleware/asyncWrapper");
const { SUCCESS } = require("../utils/httpStatusText");

// سجل التدقيق (superAdmin فقط)
const getAuditLogs = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.action) filter.action = { $regex: req.query.action, $options: "i" };
  if (req.query.targetType) filter.targetType = req.query.targetType;
  if (req.query.actorId) filter["actor.id"] = req.query.actorId;
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: logs,
  });
});

module.exports = { getAuditLogs };
