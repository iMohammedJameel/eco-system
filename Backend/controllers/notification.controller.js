const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");

// Get all notifications sent by admins (paginated + filterable by type)
const getAllNotifications = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate("sentBy", "username email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: notifications,
  });
});

const getNotificationById = asyncWrapper(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id).populate(
    "sentBy",
    "username email role",
  );
  if (!notification) return next(appError.create("الإشعار غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: notification });
});

// Create (send) a notification — broadcast to all users OR targeted to one user
const createNotification = asyncWrapper(async (req, res, next) => {
  const { title, message, type, recipient } = req.body;

  let recipientCount = 0;
  if (recipient === "all") {
    recipientCount = await User.countDocuments({ isActive: true });
  } else {
    // Validate that the targeted user exists
    const userExists = await User.exists({ _id: recipient });
    if (!userExists) return next(appError.create("المستخدم المستهدف غير موجود", 404, ERROR));
    recipientCount = 1;
  }

  const notification = await Notification.create({
    title,
    message,
    type: type || "system",
    recipient,
    recipientCount,
    sentBy: req.user.id,
  });

  res.status(201).json({ status: SUCCESS, data: notification });
});

const updateNotification = asyncWrapper(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!notification) return next(appError.create("الإشعار غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: notification });
});

const deleteNotification = asyncWrapper(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return next(appError.create("الإشعار غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, msg: "تم حذف الإشعار بنجاح" });
});

module.exports = {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};
