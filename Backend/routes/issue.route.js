const express = require("express");
const router = express.Router();
const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssueStats,
} = require("../controllers/issue.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const {
  createIssueSchema,
  updateIssueSchema,
} = require("../controllers/validation/issueValidation");

// Admin views + stats
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllIssues);
router.get("/stats", verifyToken, allowedTo("superAdmin", "operationsManager"), getIssueStats);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getIssueById);

// Admin update (status, priority, notes) + delete
router.put(
  "/:id",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(updateIssueSchema),
  updateIssue,
);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteIssue);

// User-facing creation endpoint (kept here for the admin app to test if needed)
router.post(
  "/",
  verifyToken,
  allowedTo("user", "superAdmin", "operationsManager"),
  validationSchema(createIssueSchema),
  createIssue,
);


// ═══════════ توثيق Swagger — بلاغات الأعطال ═══════════
/**
 * @openapi
 * /dashboard/issues:
 *   get:
 *     tags: [Issues]
 *     summary: كل البلاغات (فلاتر الحالة/الأولوية + ترقيم)
 *     responses:
 *       200: { description: قائمة البلاغات }
 */
/**
 * @openapi
 * /dashboard/issues/stats:
 *   get:
 *     tags: [Issues]
 *     summary: إحصائيات البلاغات (مفتوحة/قيد المعالجة/محلولة)
 *     responses:
 *       200: { description: عدّادات الحالات }
 */
/**
 * @openapi
 * /dashboard/issues:
 *   post:
 *     tags: [Issues]
 *     summary: إنشاء بلاغ عطل (متاح للمستخدم أيضًا)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [machine, type]
 *             properties:
 *               machine: { type: string }
 *               type: { type: string, enum: [broken, full, jammed, dirty, rejected_item, fraud, other] }
 *               description: { type: string }
 *               priority: { type: string, enum: [low, medium, high] }
 *     responses:
 *       201: { description: تم الإنشاء }
 */
/**
 * @openapi
 * /dashboard/issues/{id}:
 *   put:
 *     tags: [Issues]
 *     summary: تحديث البلاغ (الحالة/الأولوية/ملاحظات الأدمن)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التحديث }
 */
/**
 * @openapi
 * /dashboard/issues/{id}:
 *   delete:
 *     tags: [Issues]
 *     summary: حذف بلاغ (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */

module.exports = router;
