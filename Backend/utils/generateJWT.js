const jwt = require("jsonwebtoken");

// Access token قصير العمر — يُستخدم لكل الطلبات (Bearer)
// ملاحظة أمنية: الـ access token لا يحمل حقل type إطلاقًا —
// أي توكن يحمل type (refresh/pwdreset) يُرفض كـ access في verifyToken
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

// Refresh token طويل العمر — httpOnly cookie فقط
// المدة متغيرة: "تذكرني" = 30 يومًا، بدونها = يوم واحد (جلسة قصيرة)
const signRefreshToken = (payload, expiresIn = "7d") =>
  jwt.sign({ ...payload, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn,
  });

const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  if (decoded.type !== "refresh") throw new Error("not a refresh token");
  return decoded;
};

// Reset token لمرة واحدة — استعادة كلمة المرور (15 دقيقة فقط)
// سرّ مستقل لو متوفر، وإلا يقع على سرّ الـ refresh
const RESET_SECRET = () => process.env.JWT_RESET_SECRET || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const signResetToken = (payload) =>
  jwt.sign({ ...payload, type: "pwdreset" }, RESET_SECRET(), { expiresIn: "15m" });

const verifyResetToken = (token) => {
  const decoded = jwt.verify(token, RESET_SECRET());
  if (decoded.type !== "pwdreset") throw new Error("not a reset token");
  return decoded;
};

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, signResetToken, verifyResetToken };
