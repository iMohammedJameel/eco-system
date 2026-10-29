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
const {
  equalizeTiming,
  getLockMinutesRemaining,
  registerFailedLogin,
  resetLoginAttempts,
  buildRefreshCookieOptions,
  getRefreshDuration,
  wasRemembered,
} = require("../utils/authHelpers");

const REFRESH_COOKIE = "ecocycle_admin_rt";
const COOKIE_PATH = "/api/dashboard";

const loginAdmin = asyncWrapper(async (req, res, next) => {
  const { email, password, remember } = req.body;

  const admin = await Admin.findOne({ email }).select("+password +loginAttempts +lockUntil");
  if (!admin) {
    // مقارنة وهمية بنفس تكلفة bcrypt — منع كشف وجود الحساب عبر قياس الزمن
    await equalizeTiming(password);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  // الحساب مقفول؟
  const lockMins = getLockMinutesRemaining(admin);
  if (lockMins !== null) {
    return next(
      appError.create(`الحساب مقفول مؤقتًا بسبب محاولات دخول فاشلة — حاول مجددًا بعد ${lockMins} دقيقة`, 423, ERROR),
    );
  }

  const matched = await admin.comparePassword(password);
  if (!matched) {
    await registerFailedLogin(admin);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  // نجاح → تصفير العدادات
  await resetLoginAttempts(admin);

  // "تذكرني": refresh لمدة 30 يومًا مع كوكيز دائمة، وإلا refresh لمدة يوم واحد بكوكيز جلسة
  const wantsRemember = remember === true;
  const accessToken = signAccessToken({ id: admin._id, role: admin.role, name: admin.username });
  const refreshToken = signRefreshToken(
    { id: admin._id, role: admin.role },
    wantsRemember ? "30d" : "1d",
  );

  res.cookie(REFRESH_COOKIE, refreshToken, buildRefreshCookieOptions(COOKIE_PATH, wantsRemember));

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
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return next(appError.create("انتهت صلاحية الجلسة — سجّل الدخول من جديد", 401, ERROR));
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return next(appError.create("الحساب غير موجود", 401, ERROR));
  }

  // نُبقي نفس مدة "تذكرني" الأصلية عند التدوير
  const remembered = wasRemembered(decoded);
  const accessToken = signAccessToken({ id: admin._id, role: admin.role, name: admin.username });
  // تدوير الـ refresh token بنفس مدته
  const refreshToken = signRefreshToken({ id: admin._id, role: admin.role }, getRefreshDuration(decoded));
  res.cookie(REFRESH_COOKIE, refreshToken, buildRefreshCookieOptions(COOKIE_PATH, remembered));

  res.status(200).json({
    status: SUCCESS,
    token: accessToken,
    admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role },
  });
});

const logoutAdmin = asyncWrapper(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
  logAudit(req, { action: "auth.logout", targetType: "auth", targetId: req.user?.id, targetLabel: req.user?.name || "—" });
  res.status(200).json({ status: SUCCESS, msg: "تم تسجيل الخروج بنجاح" });
});

/* ═════════════ استعادة كلمة المرور (بدون بريد — تحقق مزدوج) ═══════════════
   الخطوة 1: البريد + (اسم المستخدم للإدارة / رقم الهاتف للمستخدمين)
   الخطوة 2: رمز استعادة لمرة واحدة صالح 15 دقيقة + كلمة مرور جديدة
   الرسالة عامة في كل حالات الفشل — لا تسريب أي معلومات عن وجود الحساب.
   ملاحظة إنتاجية: في النسخة الحقيقية يُرسل رمز التحقق عبر بريد/SMS.
   ═══════════════════════════════════════════════════════════════════════════ */
const forgotPassword = asyncWrapper(async (req, res, next) => {
  const { email, verify } = req.body;

  // مقارنة وهمية لتسوية الزمن قبل أي رد (نفس نمط تسجيل الدخول)
  await equalizeTiming(verify);

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
