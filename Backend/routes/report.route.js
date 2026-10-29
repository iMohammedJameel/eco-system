const express = require("express");
const router = express.Router();
const { exportReport } = require("../controllers/report.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

// تصدير Excel — أدمن
router.get("/export", verifyToken, allowedTo("superAdmin", "operationsManager"), exportReport);


// ═══════════ توثيق Swagger — التقارير ═══════════
/**
 * @openapi
 * /dashboard/reports/export:
 *   get:
 *     tags: [Reports]
 *     summary: تصدير تقرير Excel (معاملات + ملخص)
 *     parameters:
 *       - { name: type, in: query, schema: { type: string, enum: [all, deposits, withdrawals] } }
 *       - { name: from, in: query, schema: { type: string, format: date } }
 *       - { name: to, in: query, schema: { type: string, format: date } }
 *     responses:
 *       200:
 *         description: ملف xlsx للتحميل
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet: {}
 */

module.exports = router;
