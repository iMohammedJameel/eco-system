const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditLog.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

// سجل التدقيق — superAdmin فقط
router.get("/", verifyToken, allowedTo("superAdmin"), getAuditLogs);


// ═══════════ توثيق Swagger — سجل التدقيق ═══════════
/**
 * @openapi
 * /dashboard/audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: سجل تدقيق كل عمليات الإدارة (superAdmin فقط)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: action, in: query, schema: { type: string }, description: "مثل user.delete" }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: السجل + pagination }
 *       403: { description: superAdmin فقط }
 */

module.exports = router;
