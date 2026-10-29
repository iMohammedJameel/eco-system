const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const { ERROR } = require("../utils/httpStatusText");

module.exports = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(appError.create("التوكن مطلوب — سجّل الدخول أولًا", 401, ERROR));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // حماية: الـ access token النقي لا يحمل أي حقل type —
    // أي توكن يحمل type (refresh / pwdreset / غيره) يُرفض فورًا كـ access.
    // بدون ده، توكن استعادة كلمة المرور أو الـ refresh الطويل العمر
    // يقدر يدخل أي مسار محمي لو اشتُرِك السرّ.
    if (decoded.type) {
      return next(appError.create("توكن غير صالح — سجّل الدخول من جديد", 401, ERROR));
    }
    req.user = decoded;
    next();
  } catch {
    return next(appError.create("انتهت صلاحية التوكن أو أنه غير صالح", 401, ERROR));
  }
};
