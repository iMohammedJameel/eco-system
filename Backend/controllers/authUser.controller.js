const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Coupon = require("../models/Coupon");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/generateJWT");
const {
  equalizeTiming,
  getLockMinutesRemaining,
  registerFailedLogin,
  resetLoginAttempts,
  buildRefreshCookieOptions,
  getRefreshDuration,
  wasRemembered,
} = require("../utils/authHelpers");

const REFRESH_COOKIE = "ecocycle_user_rt";
const COOKIE_PATH = "/api/auth";

const registerUser = asyncWrapper(async (req, res, next) => {
  const { username, email, phoneNumber, password } = req.body;

  // فحص مسبق موحد للإيميل والتليفون — رسالة واضحة بدل 500 من duplicate key
  const exist = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (exist) {
    if (exist.email === String(email).toLowerCase())
      return next(appError.create("البريد الإلكتروني مستخدم بالفعل — جرّب بريدًا آخر", 400, ERROR));
    return next(appError.create("رقم الهاتف مسجّل بالفعل — يمكنك استعادة حسابك أو استخدام رقم آخر", 400, ERROR));
  }

  await User.create({ username, email, phoneNumber, password });
  res.status(201).json({
    status: SUCCESS,
    msg: "تم إنشاء حسابك بنجاح — استخدم رقم هاتفك عند الإيداع في ماكينات EcoCycle لتتراكم نقاطك",
  });
});

const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password, remember } = req.body;

  const user = await User.findOne({ email }).select("+password +loginAttempts +lockUntil");
  if (!user) {
    // مقارنة وهمية بنفس تكلفة bcrypt — منع كشف وجود الحساب عبر قياس الزمن
    await equalizeTiming(password);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  if (!user.isActive) return next(appError.create("الحساب معطّل — تواصل مع دعم EcoCycle", 403, ERROR));

  // الحساب مقفول؟
  const lockMins = getLockMinutesRemaining(user);
  if (lockMins !== null) {
    return next(
      appError.create(`الحساب مقفول مؤقتًا بسبب محاولات دخول فاشلة — حاول مجددًا بعد ${lockMins} دقيقة`, 423, ERROR),
    );
  }

  const matched = await user.comparePassword(password);
  if (!matched) {
    await registerFailedLogin(user);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  // نجاح → تصفير العدادات
  await resetLoginAttempts(user);

  // "تذكرني": 30 يومًا أو يوم واحد بكوكيز جلسة
  const wantsRemember = remember === true;
  const accessToken = signAccessToken({ id: user._id, role: "user" });
  const refreshToken = signRefreshToken({ id: user._id, role: "user" }, wantsRemember ? "30d" : "1d");

  // الـ refresh في httpOnly cookie فقط — غير قابل للسرقة عبر XSS
  res.cookie(REFRESH_COOKIE, refreshToken, buildRefreshCookieOptions(COOKIE_PATH, wantsRemember));

  res.status(200).json({ status: SUCCESS, token: accessToken });
});

// تجديد access token للمستخدم من الـ refresh cookie
const refreshUserToken = asyncWrapper(async (req, res, next) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return next(appError.create("جلسة الاستعادة غير موجودة — سجّل الدخول من جديد", 401, ERROR));

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return next(appError.create("انتهت صلاحية الجلسة — سجّل الدخول من جديد", 401, ERROR));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return next(appError.create("الحساب غير موجود", 401, ERROR));
  }
  if (!user.isActive)
    return next(appError.create("الحساب معطّل — تواصل مع دعم EcoCycle", 403, ERROR));

  // نُبقي نفس مدة "تذكرني" الأصلية عند التدوير
  const remembered = wasRemembered(decoded);
  const accessToken = signAccessToken({ id: user._id, role: "user" });
  const refreshToken = signRefreshToken({ id: user._id, role: "user" }, getRefreshDuration(decoded));
  res.cookie(REFRESH_COOKIE, refreshToken, buildRefreshCookieOptions(COOKIE_PATH, remembered));

  res.status(200).json({ status: SUCCESS, token: accessToken });
});

const logoutUser = asyncWrapper(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
  res.status(200).json({ status: SUCCESS, msg: "تم تسجيل الخروج بنجاح" });
});

const getMe = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

/**
 * ملخص محفظة المواطن — صفحة المحفظة في بوابة المواطن
 * تجمع: الرصيد + المستوى + الإحصائيات + آخر المعاملات + الكوبونات + الإنجازات
 * في طلب واحد بدل 5 طلبات منفصلة من الواجهة.
 */
const getMyWallet = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("achievements.achievement", "title icon xpReward");
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));

  const [depositAgg, withdrawAgg, byMaterial, recent, coupons] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: user._id, type: "deposit" } },
      { $group: { _id: null, count: { $sum: 1 }, earned: { $sum: "$amount" }, weight: { $sum: "$weightKg" } } },
    ]),
    Transaction.aggregate([
      { $match: { user: user._id, type: "withdrawal" } },
      { $group: { _id: null, count: { $sum: 1 }, spent: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { user: user._id, type: "deposit" } },
      { $group: { _id: "$materialType", weight: { $sum: "$weightKg" }, count: { $sum: 1 } } },
    ]),
    Transaction.find({ user: user._id })
      .populate("machine", "name location")
      .sort({ createdAt: -1 })
      .limit(5),
    Coupon.countDocuments({ user: user._id, status: "issued", expiresAt: { $gt: new Date() } }),
  ]);

  res.status(200).json({
    status: SUCCESS,
    data: {
      balance: user.balance,
      level: user.level,
      totalDepositsKg: user.totalDeposits,
      achievements: user.achievements || [],
      deposits: {
        count: depositAgg[0]?.count || 0,
        earned: depositAgg[0]?.earned || 0,
        weightKg: depositAgg[0]?.weight || 0,
      },
      withdrawals: {
        count: withdrawAgg[0]?.count || 0,
        spent: withdrawAgg[0]?.spent || 0,
      },
      byMaterial,
      activeCoupons: coupons,
      recentTransactions: recent,
    },
  });
});

const updateMe = asyncWrapper(async (req, res, next) => {
  const { username, phoneNumber } = req.body;

  // فحص مسبق لتكرار رقم الهاتف (عدا حسابي الحالي) —
  // بدونه: E11000 من الـ unique index تطلع 500 بدل رسالة واضحة
  // (نفس نمط فحص الإدارة في user.controller)
  if (phoneNumber) {
    const dup = await User.findOne({ phoneNumber, _id: { $ne: req.user.id } }).select("_id");
    if (dup)
      return next(appError.create("رقم الهاتف مسجّل بالفعل لحساب آخر", 400, ERROR));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username, phoneNumber },
    { returnDocument: "after", runValidators: true }
  );
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const changePassword = asyncWrapper(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));

  const matched = await user.comparePassword(currentPassword);
  if (!matched) return next(appError.create("كلمة المرور الحالية غير صحيحة", 400, ERROR));

  user.password = newPassword;
  await user.save();

  res.status(200).json({ status: SUCCESS, msg: "تم تحديث كلمة المرور بنجاح" });
});

module.exports = { registerUser, loginUser, refreshUserToken, logoutUser, getMe, getMyWallet, updateMe, changePassword };
