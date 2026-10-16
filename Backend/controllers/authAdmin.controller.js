const Admin = require("../models/Admin");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { ERROR, SUCCESS } = require("../utils/httpStatusText");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signResetToken,
  verifyResetToken,
} = require("../utils/generateJWT");
const { logAudit } = require("../utils/audit");
const bcrypt = require("bcrypt");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const REFRESH_COOKIE = "ecocycle_admin_rt";

// خيارات الكوكيز — "تذكرني" = 30 يومًا، بدونها = كوكيز جلسة (تُمسح مع إغلاق المتصفح)
const buildCookieOptions = (remember) => {
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/dashboard",
  };
  if (remember) opts.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 يومًا
  return opts;
};

// هاش وهمي بنفس تكلفة bcrypt — يساوي زمن الاستجابة في مسار الاستعادة
// (يمنع استغلال فرق التوقيت لتخمين وجود الحساب)
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

const loginAdmin = asyncWrapper(async (req, res, next) => {
  const { email, password, remember } = req.body;

  const admin = await Admin.findOne({ email }).select("+password +loginAttempts +lockUntil");
  if (!admin) {
    // مقارنة وهمية بنفس تكلفة bcrypt — منع كشف وجود الحساب عبر قياس الزمن
    await bcrypt.compare(String(password || ""), DUMMY_HASH);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  // الحساب مقفول؟
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    const mins = Math.ceil((admin.lockUntil - new Date()) / 60000);
    return next(
      appError.create(`الحساب مقفول مؤقتًا بسبب محاولات دخول فاشلة — حاول مجددًا بعد ${mins} دقيقة`, 423, ERROR),
    );
  }

  const matched = await admin.comparePassword(password);
  if (!matched) {
    admin.loginAttempts = (admin.loginAttempts || 0) + 1;
    if (admin.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      admin.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
      admin.loginAttempts = 0;
    }
    await admin.save();
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  // نجاح → تصفير العدادات
  if (admin.loginAttempts || admin.lockUntil) {
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
  }

  // "تذكرني": refresh لمدة 30 يومًا مع كوكيز دائمة، وإلا refresh لمدة يوم واحد بكوكيز جلسة
  const wantsRemember = remember === true;
  const payload = { id: admin._id, role: admin.role, name: admin.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(
    { id: admin._id, role: admin.role },
    wantsRemember ? "30d" : "1d",
  );

  res.cookie(REFRESH_COOKIE, refreshToken, buildCookieOptions(wantsRemember));

  logAudit(req, {
    action: "auth.login",
    targetType: "auth",
    targetId: admin._id,
    targetLabel: admin.username,
    actor: { id: admin._id, name: admin.username, role: admin.role },
  });

  res.status(200).json({
    status: SUCCESS,
    token: accessToken,
    admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
  });
});

// تجديد access token من refresh cookie
const refreshAdminToken = asyncWrapper(async (req, res, next) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return next(appError.create("جلسة الاستعادة غير موجودة — سجّل الدخول من جديد", 401, ERROR));

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/dashboard" });
    return next(appError.create("انتهت صلاحية الجلسة — سجّل الدخول من جديد", 401, ERROR));
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    res.clearCookie(REFRESH_COOKIE, { path: "/api/dashboard" });
    return next(appError.create("الحساب غير موجود", 401, ERROR));
  }

  // نُبقي نفس مدة "تذكرني" الأصلية: 30 يومًا إذا كان التوكن الأصلي 30 يومًا
  const isLongLived = decoded.exp - decoded.iat >= 29 * 24 * 3600;
  const accessToken = signAccessToken({ id: admin._id, role: admin.role, name: admin.username });
  // تدوير الـ refresh token بنفس مدته
  const refreshToken = signRefreshToken({ id: admin._id, role: admin.role }, isLongLived ? "30d" : "1d");
  res.cookie(REFRESH_COOKIE, refreshToken, buildCookieOptions(isLongLived));

  res.status(200).json({
    status: SUCCESS,
    token: accessToken,
    admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
  });
});

const logoutAdmin = asyncWrapper(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/dashboard" });
  logAudit(req, { action: "auth.logout", targetType: "auth", targetId: req.user?.id, targetLabel: req.user?.name || "—" });
  res.status(200).json({ status: SUCCESS, msg: "تم تسجيل الخروج بنجاح" });
});

/* ═══════════════ استعادة كلمة المرور (بدون بريد — تحقق مزدوج) ═══════════════
   الخطوة 1: البريد + (اسم المستخدم للإدارة / رقم الهاتف للمستخدمين)
   الخطوة 2: رمز استعادة لمرة واحدة صالح 15 دقيقة + كلمة مرور جديدة
   الرسالة عامة في كل حالات الفشل — لا تسريب أي معلومات عن وجود الحساب.
   ملاحظة إنتاجية: في النسخة الحقيقية يُرسل رمز التحقق عبر بريد/SMS.
   ═══════════════════════════════════════════════════════════════════════════ */
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email, verify } = req.body;

  // مقارنة وهمية لتسوية الزمن قبل أي رد (نفس نمط تسجيل الدخول)
  await bcrypt.compare(String(verify || ""), DUMMY_HASH);

  let account = null;
  let kind = null;

  const admin = await Admin.findOne({ email });
  if (admin && admin.username === String(verify ?? "").trim()) {
    account = admin;
    kind = "admin";
  } else {
    const user = await User.findOne({ email });
    if (user && user.phoneNumber === String(verify ?? "").trim()) {
      account = user;
      kind = "user";
    }
  }

  if (!account) {
    return next(
      appError.create(
        "بيانات التحقق غير صحيحة — تأكد من البريد ومن (اسم المستخدم للإدارة أو رقم الهاتف للمستخدمين)",
        400,
        ERROR,
      ),
    );
  }

  const resetToken = signResetToken({ id: account._id, kind });

  logAudit(req, {
    action: "auth.forgot_password",
    targetType: "auth",
    targetId: account._id,
    targetLabel: account.username,
    actor: {
      id: account._id,
      name: account.username,
      role: kind === "admin" ? account.role : "user",
    },
  });

  res.status(200).json({
    status: SUCCESS,
    msg: "تم التحقق من هويتك — أدخل كلمة المرور الجديدة",
    resetToken,
  });
});

const resetPassword = asyncWrapper(async (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  let decoded;
  try {
    decoded = verifyResetToken(resetToken);
  } catch {
    return next(appError.create("رمز الاستعادة غير صالح أو منتهي — ابدأ عملية الاستعادة من جديد", 401, ERROR));
  }

  const Model = decoded.kind === "admin" ? Admin : User;
  const account = await Model.findById(decoded.id).select("+password +loginAttempts +lockUntil");
  if (!account) {
    return next(appError.create("الحساب غير موجود", 404, ERROR));
  }

  account.password = newPassword;
  // تصفير قفل الحساب — كلمة المرور الجديدة تعني مالك الحساب استعاد السيطرة
  account.loginAttempts = 0;
  account.lockUntil = null;
  await account.save();

  logAudit(req, {
    action: "auth.reset_password",
    targetType: "auth",
    targetId: account._id,
    targetLabel: account.username,
    actor: {
      id: account._id,
      name: account.username,
      role: decoded.kind === "admin" ? account.role : "user",
    },
  });

  res.status(200).json({
    status: SUCCESS,
    msg: "تم تغيير كلمة المرور بنجاح — يمكنك تسجيل الدخول الآن",
  });
});

module.exports = { loginAdmin, refreshAdminToken, logoutAdmin, forgotPassword, resetPassword };
