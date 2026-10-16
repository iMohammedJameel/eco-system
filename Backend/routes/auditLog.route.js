const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditLog.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

// سجل التدقيق — superAdmin فقط
router.get("/", verifyToken, allowedTo("superAdmin"), getAuditLogs);

module.exports = router;
