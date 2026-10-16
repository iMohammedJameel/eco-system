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
router.get("/qr-info", publicLimiter, getQRSessionInfo);
router.get("/materials", publicLimiter, getActiveMaterials);
router.post(
  "/claim-public",
  publicLimiter,
  validationSchema(publicClaimSchema),
  claimPublicDeposit,
);

// Admin only
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllTransactions);

// User routes
router.post("/qr-session", verifyToken, allowedTo("user"), validationSchema(qrSessionSchema), generateQRSession);
router.get("/my", verifyToken, allowedTo("user"), getMyTransactions);
router.post("/deposit", verifyToken, allowedTo("user"), validationSchema(depositSchema), deposit);
router.post("/withdraw", verifyToken, allowedTo("user"), validationSchema(withdrawSchema), withdraw);

// Shared
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager", "user"), getTransactionById);

module.exports = router;
