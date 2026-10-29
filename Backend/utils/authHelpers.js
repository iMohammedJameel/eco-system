/**
 * منطق المصادقة المشترك بين مساري الأدمن (/api/dashboard) والمستخدم (/api/auth).
 *
 * قبل هذا الملف: نفس منطق القفل/الكوكيز/تدوير التوكن كان مكررًا حرفيًا
 * في authAdmin.controller و authUser.controller (~120 سطر ×2) —
 * أي تصحيح أمني كان لازم يتطبق في مكانين وينسى في التالت.
 * الآن مصدر حقيقة واحد لكل منطق الأمان الحساس.
 */
const bcrypt = require("bcrypt");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const REMEMBER_DAYS = 30;
const SHORT_SESSION_DAYS = 1;

// هاش وهمي بنفس تكلفة bcrypt — يساوي زمن الاستجابة في مسار الفشل
// (يمنع استغلال فرق التوقيت لتخمين وجود الحساب)
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

/** مقارنة وهمية بنفس تكلفة bcrypt — تُستدعى قبل أي رد فشل */
async function equalizeTiming(secret) {
  await bcrypt.compare(String(secret || ""), DUMMY_HASH);
}

/** دقائق القفل المتبقية — أو null لو الحساب غير مقفول */
function getLockMinutesRemaining(account) {
  if (account.lockUntil && account.lockUntil > new Date()) {
    return Math.ceil((account.lockUntil - new Date()) / 60000);
  }
  return null;
}

/**
 * تسجيل محاولة دخول فاشلة: زيادة العداد، وعند بلوغ الحد الأقصى
 * يقفل الحساب ويُصفّر العداد (يبدأ العد من جديد بعد فك القفل).
 */
async function registerFailedLogin(account) {
  account.loginAttempts = (account.loginAttempts || 0) + 1;
  if (account.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    account.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
    account.loginAttempts = 0;
  }
  await account.save();
}

/** تصفير عدادات القفل بعد دخول ناجح (توفير save لو لا شيء تغيّر) */
async function resetLoginAttempts(account) {
  if (account.loginAttempts || account.lockUntil) {
    account.loginAttempts = 0;
    account.lockUntil = null;
    await account.save();
  }
}

/**
 * خيارات كوكيز الـ refresh — "تذكرني" = 30 يومًا (كوكيز دائمة)،
 * بدونها = كوكيز جلسة تُمسح مع إغلاق المتصفح.
 * المسار (path) هو الفرق الوحيد بين مسار الأدمن والمستخدم.
 */
function buildRefreshCookieOptions(path, remember) {
  const opts = {
    httpOnly: true, // غير قابل للسرقة عبر XSS
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path, // الكوكيز لا تُرسل إلا لمسارها الخاص فقط
  };
  if (remember) opts.maxAge = REMEMBER_DAYS * 24 * 60 * 60 * 1000;
  return opts;
}

/**
 * مدة الـ refresh عند التدوير: نحافظ على نفس مدة "تذكرني" الأصلية —
 * توكن 30 يومًا يُدوَّر لـ 30 يومًا، وتوكن جلسة يبقى قصيرًا.
 */
function getRefreshDuration(decoded) {
  return decoded.exp - decoded.iat >= (REMEMBER_DAYS - 1) * 24 * 3600
    ? `${REMEMBER_DAYS}d`
    : `${SHORT_SESSION_DAYS}d`;
}

/** هل كان التوكن الأصلي "تذكرني" (30 يومًا)؟ — يحدد شكل الكوكيز الجديدة */
function wasRemembered(decoded) {
  return decoded.exp - decoded.iat >= (REMEMBER_DAYS - 1) * 24 * 3600;
}

module.exports = {
  MAX_LOGIN_ATTEMPTS,
  LOCK_MINUTES,
  equalizeTiming,
  getLockMinutesRemaining,
  registerFailedLogin,
  resetLoginAttempts,
  buildRefreshCookieOptions,
  getRefreshDuration,
  wasRemembered,
};
