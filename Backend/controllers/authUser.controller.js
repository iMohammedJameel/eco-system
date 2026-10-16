const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/generateJWT");
const bcrypt = require("bcrypt");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const REFRESH_COOKIE = "ecocycle_user_rt";

// "تذكرني" = 30 يومًا، بدونها = كوكيز جلسة (تُمسح مع إغلاق المتصفح)
const buildCookieOptions = (remember) => {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  };
  if (remember) opts.maxAge = 30 * 24 * 60 * 60 * 1000;
  return opts;
};

// هاش وهمي بنفس تكلفة bcrypt — يساوي زمن الاستجابة لما الإيميل غير موجود
// (يمنع استغلال فرق التوقيت لتخمين وجود الحساب)
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

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
    await bcrypt.compare(String(password || ""), DUMMY_HASH);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  if (!user.isActive) return next(appError.create("الحساب معطّل — تواصل مع دعم EcoCycle", 403, ERROR));

  // الحساب مقفول؟
  if (user.lockUntil && user.lockUntil > new Date()) {
    const mins = Math.ceil((user.lockUntil - new Date()) / 60000);
    return next(
      appError.create(`الحساب مقفول مؤقتًا بسبب محاولات دخول فاشلة — حاول مجددًا بعد ${mins} دقيقة`, 423, ERROR),
    );
  }

  const matched = await user.comparePassword(password);
  if (!matched) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
      user.loginAttempts = 0;
    }
    await user.save();
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  // نجاح → تصفير العدادات
  if (user.loginAttempts || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  // "تذكرني": 30 يومًا أو يوم واحد بكوكيز جلسة
  const wantsRemember = remember === true;
  const accessToken = signAccessToken({ id: user._id, role: "user" });
  const refreshToken = signRefreshToken({ id: user._id, role: "user" }, wantsRemember ? "30d" : "1d");

  // الـ refresh في httpOnly cookie فقط — غير قابل للسرقة عبر XSS
  res.cookie(REFRESH_COOKIE, refreshToken, buildCookieOptions(wantsRemember));

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
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return next(appError.create("انتهت صلاحية الجلسة — سجّل الدخول من جديد", 401, ERROR));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return next(appError.create("الحساب غير موجود", 401, ERROR));
  }
  if (!user.isActive)
    return next(appError.create("الحساب معطّل — تواصل مع دعم EcoCycle", 403, ERROR));

  // نُبقي نفس مدة "تذكرني" الأصلية عند التدوير
  const isLongLived = decoded.exp - decoded.iat >= 29 * 24 * 3600;
  const accessToken = signAccessToken({ id: user._id, role: "user" });
  const refreshToken = signRefreshToken({ id: user._id, role: "user" }, isLongLived ? "30d" : "1d");
  res.cookie(REFRESH_COOKIE, refreshToken, buildCookieOptions(isLongLived));

  res.status(200).json({ status: SUCCESS, token: accessToken });
});

const logoutUser = asyncWrapper(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(200).json({ status: SUCCESS, msg: "تم تسجيل الخروج بنجاح" });
});

const getMe = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const updateMe = asyncWrapper(async (req, res, next) => {
  const { username, phoneNumber } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username, phoneNumber },
    { new: true, runValidators: true }
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

module.exports = { registerUser, loginUser, refreshUserToken, logoutUser, getMe, updateMe, changePassword };
