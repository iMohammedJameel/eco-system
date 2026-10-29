const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Coupon = require("../models/Coupon");
const Issue = require("../models/Issue");
const Notification = require("../models/Notification");
const QRSession = require("../models/QRSession");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");
const { searchQuery } = require("../utils/searchHelpers");

const getAllUsers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // بحث من السيرفر — يعمل عبر كل الصفحات مش الصفحة المعروضة فقط
  const filter = {};
  if (req.query.search) {
    Object.assign(filter, searchQuery(["username", "email", "phoneNumber"], req.query.search));
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: users,
  });
});

const getUserById = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const createUser = asyncWrapper(async (req, res, next) => {
  const { username, email, phoneNumber, password } = req.body;

  // فحص موحد للإيميل والتليفون قبل الإنشاء — 400 واضحة بدل duplicate key 500
  const existUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existUser) {
    if (existUser.email === String(email).toLowerCase())
      return next(appError.create("البريد الإلكتروني مستخدم بالفعل — جرّب بريدًا آخر", 400, ERROR));
    return next(appError.create("رقم الهاتف مسجّل بالفعل", 400, ERROR));
  }

  const user = await User.create({ username, email, phoneNumber, password });
  logAudit(req, { action: "user.create", targetType: "user", targetId: user._id, targetLabel: username });
  res.status(201).json({ status: SUCCESS, msg: "تم إنشاء المستخدم بنجاح" });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const { username, email, phoneNumber, isActive } = req.body;

  // فحص التفرّد مع استثناء المستخدم نفسه — يمنع E11000 غير مُعالج
  const dupFields = {};
  if (email) dupFields.email = email;
  if (phoneNumber) dupFields.phoneNumber = phoneNumber;
  if (Object.keys(dupFields).length > 0) {
    dupFields._id = { $ne: req.params.id };
    const dup = await User.findOne(dupFields);
    if (dup) {
      const msg = dup.email === String(email).toLowerCase()
        ? "البريد الإلكتروني مستخدم بالفعل من مستخدم آخر"
        : "رقم الهاتف مسجّل بالفعل من مستخدم آخر";
      return next(appError.create(msg, 400, ERROR));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { username, email, phoneNumber, isActive },
    { returnDocument: "after", runValidators: true }
  );
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  logAudit(req, {
    action: "user.update", targetType: "user", targetId: user._id, targetLabel: user.username,
    meta: { isActive: user.isActive },
  });
  res.status(200).json({ status: SUCCESS, data: user });
});

/**
 * حذف المستخدم + تنظيف كل البيانات المرتبطة به (Cascade)
 * قبل الإصلاح: كان بيمسح المستخدم بس ويسيب سجلات يتيمة
 * (transactions/coupons/issues/notifications بمرجع لمستخدم محذوف)
 * تؤدي لـ populate=null ونتائج leaderboard/تقارير مشوهة.
 */
const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));

  // تنظيف كل السجلات المرتبطة — بالتوازي لأقصى سرعة
  // ملاحظة الإشعارات: حقل recipient من نوع Mixed — يُخزَّن أحيانًا ObjectId (seed/محرك الإنجازات)
  // وأحيانًا نصًا (لوحة الأدمن من req.body) — فنحذف بالصيغتين معًا لضمان عدم بقاء سجلات يتيمة
  const userIdStr = String(user._id);
  const [txResult, couponResult, issueResult, notifResult, qrResult] = await Promise.all([
    Transaction.deleteMany({ user: user._id }),
    Coupon.deleteMany({ user: user._id }),
    Issue.deleteMany({ user: user._id }),
    Notification.deleteMany({ recipient: { $in: [user._id, userIdStr] } }),
    QRSession.deleteMany({ user: user._id }),
  ]);

  await User.deleteOne({ _id: user._id });

  logAudit(req, {
    action: "user.delete",
    targetType: "user",
    targetId: user._id,
    targetLabel: user.username,
    meta: {
      cleaned: {
        transactions: txResult.deletedCount,
        coupons: couponResult.deletedCount,
        issues: issueResult.deletedCount,
        notifications: notifResult.deletedCount,
        qrSessions: qrResult.deletedCount,
      },
    },
  });

  res.status(200).json({
    status: SUCCESS,
    msg: "تم حذف المستخدم بنجاح",
    data: {
      cleaned: {
        transactions: txResult.deletedCount,
        coupons: couponResult.deletedCount,
        issues: issueResult.deletedCount,
        notifications: notifResult.deletedCount,
        qrSessions: qrResult.deletedCount,
      },
    },
  });
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
