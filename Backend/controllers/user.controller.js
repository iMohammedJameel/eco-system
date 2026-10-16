const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");

const getAllUsers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
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
    { new: true, runValidators: true }
  );
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  logAudit(req, {
    action: "user.update", targetType: "user", targetId: user._id, targetLabel: user.username,
    meta: { isActive: user.isActive },
  });
  res.status(200).json({ status: SUCCESS, data: user });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  logAudit(req, { action: "user.delete", targetType: "user", targetId: user._id, targetLabel: user.username });
  res.status(200).json({ status: SUCCESS, msg: "تم حذف المستخدم بنجاح" });
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
