const express = require("express");
const router = express.Router();
const { generateQRSession, getAllTransactions, getMyTransactions, deposit, withdraw, getTransactionById } = require("../controllers/transaction.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { depositSchema, withdrawSchema, qrSessionSchema } = require("../controllers/validation/transactionValidation");

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
