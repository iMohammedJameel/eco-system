/**
 * مصادقة الشركاء — بوابة الشركاء الحقيقية
 * قبل هذا الملف: بوابة الشركاء كانت "وضع عرض" للأدمن فقط —
 * الشريك الحقيقي ماكانش عنده حساب ولا يدخل بنفسه.
 * الآن: لكل شريك حساب (contactEmail + password) و JWT role=partner.
 *
 * يستخدم نفس بنية الأمان الكاملة للأدمن/المستخدم:
 * - قفل الحساب بعد 5 محاولات فاشلة (15 دقيقة)
 * - تساوي زمن الاستجابة (منع كشف وجود الحساب)
 * - refresh token في httpOnly cookie بمسار خاص
 */
const Partner = require("../models/Partner");
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
const { logAudit } = require("../utils/audit");

const REFRESH_COOKIE = "ecocycle_partner_rt";
const COOKIE_PATH = "/api/partner-portal";

const loginPartner = asyncWrapper(async (req, res, next) => {
  const { email, password, remember } = req.body;

  const partner = await Partner.findOne({ contactEmail: String(email || "").toLowerCase() })
    .select("+password +loginAttempts +lockUntil");
  if (!partner) {
    await equalizeTiming(password);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  if (!partner.password)
    return next(appError.create("لم يُفعّل الدخول لهذا الحساب بعد — تواصل مع إدارة EcoCycle", 403, ERROR));

  if (!partner.isActive)
    return next(appError.create("حساب الشريك معطّل — تواصل مع إدارة EcoCycle", 403, ERROR));

  const lockMins = getLockMinutesRemaining(partner);
  if (lockMins !== null) {
    return next(
      appError.create(`الحساب مقفول مؤقتًا بسبب محاولات دخول فاشلة — حاول مجددًا بعد ${lockMins} دقيقة`, 423, ERROR),
    );
  }

  const matched = await partner.comparePassword(password);
  if (!matched) {
    await registerFailedLogin(partner);
    return next(appError.create("البريد الإلكتروني أو كلمة المرور غير صحيحة", 400, ERROR));
  }

  await resetLoginAttempts(partner);

  const wantsRemember = remember === true;
  const accessToken = signAccessToken({ id: partner._id, role: "partner" });
  const refreshToken = signRefreshToken({ id: partner._id, role: "partner" }, wantsRemember ? "30d" : "1d");

  res.cookie(REFRESH_COOKIE, refreshToken, buildRefreshCookieOptions(COOKIE_PATH, wantsRemember));

  logAudit(req, {
    action: "partner.login",
    targetType: "partner",
    targetId: partner._id,
    targetLabel: partner.name,
  });

  // بروفايل مختصر للواجهة (بدون بيانات حساسة) — يُخزَّن لعرض الاسم والدور في النافبار
  res.status(200).json({
    status: SUCCESS,
    token: accessToken,
    partner: {
      id: partner._id,
      name: partner.name,
      role: "partner",
      category: partner.category,
    },
  });
});

const refreshPartnerToken = asyncWrapper(async (req, res, next) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) return next(appError.create("جلسة الاستعادة غير موجودة — سجّل الدخول من جديد", 401, ERROR));

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return next(appError.create("انتهت صلاحية الجلسة — سجّل الدخول من جديد", 401, ERROR));
  }

  const partner = await Partner.findById(decoded.id);
  if (!partner) {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    return next(appError.create("حساب الشريك غير موجود", 401, ERROR));
  }
  if (!partner.isActive)
    return next(appError.create("حساب الشريك معطّل — تواصل مع إدارة EcoCycle", 403, ERROR));

  const remembered = wasRemembered(decoded);
  const accessToken = signAccessToken({ id: partner._id, role: "partner" });
  const refreshToken = signRefreshToken({ id: partner._id, role: "partner" }, getRefreshDuration(decoded));
  res.cookie(REFRESH_COOKIE, refreshToken, buildRefreshCookieOptions(COOKIE_PATH, remembered));

  res.status(200).json({ status: SUCCESS, token: accessToken, partner: { id: partner._id, name: partner.name, role: "partner" } });
});

const logoutPartner = asyncWrapper(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
  res.status(200).json({ status: SUCCESS, msg: "تم تسجيل الخروج بنجاح" });
});

module.exports = { loginPartner, refreshPartnerToken, logoutPartner };
