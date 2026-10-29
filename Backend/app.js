require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// ═══════════ الأمان والتهيئة ═══════════
app.use(helmet({ contentSecurityPolicy: false })); // 11 حماية header (CSP معطلة لسماح Swagger UI)
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
// قائمة النطاقات المسموح لها ببعت الـ httpOnly refresh cookie.
// origin: true كانت تسمح لأي موقع بالعالم يبعت طلبات موثّقة — خطر في الإنتاج.
// DEFAULT_DEV_ORIGINS للتجربة المحلية فقط؛ في الإنتاج يُضبط ALLOWED_ORIGINS في .env
const DEFAULT_DEV_ORIGINS = ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"];
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOrigins = allowedOrigins.length > 0 ? allowedOrigins : DEFAULT_DEV_ORIGINS;

app.use(
  cors({
    // reflectRequestOrigin كان بيرجّع أي origin — نستبدله بقائمة بيضاء صريحة
    origin: (origin, callback) => {
      // طلبات بدون origin (same-origin / curl / mobile app) مسموحة
      if (!origin || corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("غير مسموح بالوصول من هذا النطاق (CORS)"));
    },
    credentials: true, // يسمح بمرور httpOnly refresh cookies
  }),
);

/**
 * مانع NoSQL injection — بديل express-mongo-sanitize (غير المتوافق مع Express 5)
 * يشيل أي مفتاح يبدأ بـ $ أو يحتوي . من body/params/query
 */
const sanitizeKeys = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
  for (const key of Object.keys(obj)) {
    if (/^\$/.test(key) || key.includes(".")) {
      delete obj[key];
    } else {
      sanitizeKeys(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  sanitizeKeys(req.body);
  sanitizeKeys(req.params);
  if (req.query) sanitizeKeys(req.query);
  next();
});

app.use(morgan("tiny")); // تسجيل كل الطلبات

const authLimiter = (max = 10) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // الدخول: 20 محاولة/15 دقيقة (القفل بعد 5 محاولات فاشلة هو الحماية الأساسية
    // من التخمين — والحد هنا طبقة إضافية لطيفة مع العروض التوضيحية)
    max,
    // في بيئة الاختبار: مفيش حد — التيستات بتعمل عشرات الطلبات المتتالية من نفس الـ IP
    skip: () => process.env.NODE_ENV === "test",
    message: { status: "error", msg: "محاولات كثيرة جدًا — انتظر قليلًا ثم حاول مجددًا" },
  });

// ═══════════ المسارات ═══════════
const authRoutes = require("./routes/auth.route");
const authUserRoutes = require("./routes/authUser.route");
const userRoutes = require("./routes/user.route");
const machineRoutes = require("./routes/machine.route");
const transactionRoutes = require("./routes/transaction.route");
const statsRoutes = require("./routes/stats.route");
const pricingRoutes = require("./routes/pricing.route");
const partnerRoutes = require("./routes/partner.route");
const notificationRoutes = require("./routes/notification.route");
const achievementRoutes = require("./routes/achievement.route");
const issueRoutes = require("./routes/issue.route");
const couponRoutes = require("./routes/coupon.route");
const auditLogRoutes = require("./routes/auditLog.route");
const reportRoutes = require("./routes/report.route");
const partnerPortalRoutes = require("./routes/partnerPortal.route");

app.use("/api/dashboard/login", authLimiter(20));
app.use("/api/auth/login", authLimiter(20));
app.use("/api/auth/register", authLimiter());
app.use("/api/partner-portal/login", authLimiter(20));
// حماية مسارات استعادة كلمة المرور من التخمين الآلي
app.use("/api/dashboard/forgot-password", authLimiter());
app.use("/api/dashboard/reset-password", authLimiter());
app.use("/api/dashboard", authRoutes);
app.use("/api/auth", authUserRoutes);
app.use("/api/dashboard/users", userRoutes);
app.use("/api/dashboard/machines", machineRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard/stats", statsRoutes);
app.use("/api/dashboard/pricing", pricingRoutes);
app.use("/api/dashboard/partners", partnerRoutes);
app.use("/api/dashboard/notifications", notificationRoutes);
app.use("/api/dashboard/achievements", achievementRoutes);
app.use("/api/dashboard/issues", issueRoutes);
app.use("/api/dashboard/coupons", couponRoutes);
app.use("/api/dashboard/audit-logs", auditLogRoutes);
app.use("/api/dashboard/reports", reportRoutes);
app.use("/api/partner-portal", partnerPortalRoutes);

// ═══════════ توثيق Swagger ═══════════
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/openapi");
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "EcoCycle API Docs",
  }),
);
app.get("/api/openapi.json", (req, res) => res.json(swaggerSpec));

// فحص الصحة
app.get("/api/health", (req, res) =>
  res.json({ status: "success", msg: "EcoCycle API is running", uptime: process.uptime() }),
);

// 404 Handler (Express 5 syntax — uses {*splat} instead of *)
app.all("/{*splat}", (req, res) => {
  res.status(404).json({ status: "error", msg: "المورد المطلوب غير موجود" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // خطأ JSON من express.json() — نص عربي واضح بدل الإنجليزي الخام
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ status: "error", msg: "صيغة البيانات المُرسلة غير صالحة (JSON تالف)" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ status: "error", msg: "حجم البيانات المُرسلة كبير جدًا (الحد 1 ميجابايت)" });
  }
  res.status(err.statusCode || 500).json({
    status: err.statusText || "error",
    msg: err.message || "حدث خطأ غير متوقع في الخادم — حاول مجددًا",
  });
});

module.exports = app;
