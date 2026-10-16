const Issue = require("../models/Issue");
const Machine = require("../models/Machine");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");

// Get all issues with filters (status, priority, type, machineId) + pagination
const getAllIssues = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.machineId) filter.machine = req.query.machineId;

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .populate("user", "username email phoneNumber")
      .populate("machine", "name location governorate")
      .populate("resolvedBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Issue.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: issues,
  });
});

const getIssueById = asyncWrapper(async (req, res, next) => {
  const issue = await Issue.findById(req.params.id)
    .populate("user", "username email phoneNumber")
    .populate("machine", "name location governorate status")
    .populate("resolvedBy", "username");
  if (!issue) return next(appError.create("البلاغ غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: issue });
});

// Create a new issue (called by users from the mobile app, but admins can also create)
const createIssue = asyncWrapper(async (req, res, next) => {
  const { machine: machineId, type, description, priority } = req.body;

  const machine = await Machine.findById(machineId);
  if (!machine) return next(appError.create("الماكينة غير موجودة", 404, ERROR));

  const issue = await Issue.create({
    user: req.user.id,
    machine: machineId,
    type,
    description: description || "",
    priority: priority || "medium",
  });

  await issue.populate("machine", "name location governorate");

  res.status(201).json({ status: SUCCESS, data: issue });
});

// Update issue status/notes (admin action)
const updateIssue = asyncWrapper(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const update = { ...req.body };
  if (status === "resolved" || status === "dismissed") {
    update.resolvedBy = req.user.id;
    update.resolvedAt = new Date();
  }

  const issue = await Issue.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true },
  )
    .populate("user", "username email phoneNumber")
    .populate("machine", "name location governorate")
    .populate("resolvedBy", "username");

  if (!issue) return next(appError.create("البلاغ غير موجود", 404, ERROR));

  // إذا اتشال البلاغ وكان عن ماكينة معطلة — نرجعها للتشغيل
  // مع مراعاة نسبة الامتلاء (شبه ممتلئة بدل "تعمل" لو ≥ 90%)
  if (status === "resolved" && issue.machine && issue.type === "broken") {
    const machineDoc = await Machine.findById(issue.machine._id);
    if (machineDoc && machineDoc.status === "offline") {
      await Machine.findByIdAndUpdate(issue.machine._id, {
        status: (machineDoc.fillPercentage || 0) >= 90 ? "nearlyFull" : "active",
      });
    }
  }

  logAudit(req, {
    action: "issue.update", targetType: "issue", targetId: issue._id,
    targetLabel: issue.type, meta: { status: issue.status },
  });
  res.status(200).json({ status: SUCCESS, data: issue });
});

const deleteIssue = asyncWrapper(async (req, res, next) => {
  const issue = await Issue.findByIdAndDelete(req.params.id);
  if (!issue) return next(appError.create("البلاغ غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, msg: "تم حذف البلاغ بنجاح" });
});

// Quick stats for the dashboard / issues page
const getIssueStats = asyncWrapper(async (req, res) => {
  const [openCount, inProgressCount, resolvedCount, dismissedCount, highPriority] =
    await Promise.all([
      Issue.countDocuments({ status: "open" }),
      Issue.countDocuments({ status: "in_progress" }),
      Issue.countDocuments({ status: "resolved" }),
      Issue.countDocuments({ status: "dismissed" }),
      Issue.countDocuments({ priority: "high", status: { $in: ["open", "in_progress"] } }),
    ]);

  res.status(200).json({
    status: SUCCESS,
    data: {
      open: openCount,
      in_progress: inProgressCount,
      resolved: resolvedCount,
      dismissed: dismissedCount,
      high_priority_open: highPriority,
      total: openCount + inProgressCount + resolvedCount + dismissedCount,
    },
  });
});

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueStats,
};
