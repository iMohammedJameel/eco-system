const express = require("express");
const router = express.Router();
const {
  generateQRSession,
  getAllTransactions,
  getMyTransactions,
  getQRSessionInfo,
  getActiveMaterials,
  claimPublicDeposit,
  deposit,
  withdraw,
  getTransactionById,
} = require("../controllers/transaction.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const {
  depositSchema,
  withdrawSchema,
  qrSessionSchema,
  publicClaimSchema,
} = require("../controllers/validation/transactionValidation");

const publicLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { status: "error", msg: "محاولات كثيرة جدًا — انتظر قليلًا ثم حاول مجددًا" },
});

// ═══ مسارات عامة (PWA — بدون توثيق) ═══
/**
 * @openapi
 * /transactions/qr-info:
 *   get:
 *     tags: [Transactions (PWA)]
 *     summary: معلومات جلسة QR (عام — لصفحة الإيداع)
 *     security: []
 *     parameters:
 *       - { name: qrToken, in: query, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: صلاحية الجلسة + بيانات الماكينة }
 *       404: { description: جلسة غير صالحة }
 */
router.get("/qr-info", publicLimiter, getQRSessionInfo);

/**
 * @openapi
 * /transactions/materials:
 *   get:
 *     tags: [Transactions (PWA)]
 *     summary: أسعار الخامات النشطة (عام)
 *     security: []
 *     responses:
 *       200: { description: قائمة المواد وسعر الكيلو }
 */
router.get("/materials", publicLimiter, getActiveMaterials);

/**
 * @openapi
 * /transactions/claim-public:
 *   post:
 *     tags: [Transactions (PWA)]
 *     summary: إيداع عام عبر PWA (بدون تسجيل دخول — بالتليفون)
 *     description: يحجز جلسة QR ذرّيًا، ينشئ حسابًا تلقائيًا لأول مرة، ويقيّم الإيداع فورًا.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrToken, phoneNumber, materialType, weightKg]
 *             properties:
 *               qrToken: { type: string }
 *               phoneNumber: { type: string, example: "01000000001" }
 *               materialType: { type: string, enum: [plastic, glass, cardboard, paper] }
 *               weightKg: { type: number, example: 2.5 }
 *               username: { type: string }
 *     responses:
 *       201: { description: تم الإيداع + الرصيد الجديد + الإنجازات }
 *       400: { description: جلسة QR غير صالحة أو بيانات ناقصة }
 */
router.post(
  "/claim-public",
  publicLimiter,
  validationSchema(publicClaimSchema),
  claimPublicDeposit,
);

// Admin only
/**
 * @openapi
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: كل المعاملات (أدمن — فلاتر + بحث + ترقيم)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: type, in: query, schema: { type: string, enum: [deposit, withdrawal] } }
 *       - { name: materialType, in: query, schema: { type: string } }
 *       - { name: userId, in: query, schema: { type: string } }
 *       - { name: machineId, in: query, schema: { type: string } }
 *       - { name: suspicious, in: query, schema: { type: string, enum: ["true"] } }
 *       - { name: search, in: query, schema: { type: string }, description: بحث بالمستخدم }
 *     responses:
 *       200: { description: قائمة المعاملات + pagination }
 */
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllTransactions);

// User routes
/**
 * @openapi
 * /transactions/qr-session:
 *   post:
 *     tags: [Transactions (User)]
 *     summary: توليد جلسة QR (مستخدم مسجّل)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [machineId]
 *             properties:
 *               machineId: { type: string }
 *     responses:
 *       201: { description: qrToken صالح 5 دقائق }
 */
router.post("/qr-session", verifyToken, allowedTo("user"), validationSchema(qrSessionSchema), generateQRSession);

/**
 * @openapi
 * /transactions/my:
 *   get:
 *     tags: [Transactions (User)]
 *     summary: معاملاتي (المواطن)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: type, in: query, schema: { type: string, enum: [deposit, withdrawal] } }
 *     responses:
 *       200: { description: سجل معاملات المستخدم }
 */
router.get("/my", verifyToken, allowedTo("user"), getMyTransactions);

/**
 * @openapi
 * /transactions/deposit:
 *   post:
 *     tags: [Transactions (User)]
 *     summary: إيداع بجلسة QR (مستخدم مسجّل)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrToken, materialType, weightKg]
 *             properties:
 *               qrToken: { type: string }
 *               materialType: { type: string, enum: [plastic, glass, cardboard, paper] }
 *               weightKg: { type: number }
 *               itemsCount: { type: integer }
 *     responses:
 *       201: { description: تم الإيداع + الرصيد الجديد }
 *       403: { description: الجلسة لا تخص الحساب }
 */
router.post("/deposit", verifyToken, allowedTo("user"), validationSchema(depositSchema), deposit);

/**
 * @openapi
 * /transactions/withdraw:
 *   post:
 *     tags: [Transactions (User)]
 *     summary: سحب من الرصيد (خصم ذرّي)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, withdrawalMethod, accountNumber]
 *             properties:
 *               amount: { type: number, example: 50 }
 *               withdrawalMethod: { type: string, enum: [coupon, wallet, bank] }
 *               accountNumber: { type: string }
 *     responses:
 *       201: { description: تم السحب }
 *       400: { description: الرصيد غير كافٍ }
 */
router.post("/withdraw", verifyToken, allowedTo("user"), validationSchema(withdrawSchema), withdraw);

// Shared
/**
 * @openapi
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: معاملة بالمعرّف (المستخدم يراها لو كانت له فقط)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: بيانات المعاملة }
 *       403: { description: ليست معاملتك }
 *       404: { description: غير موجودة }
 */
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager", "user"), getTransactionById);

module.exports = router;
