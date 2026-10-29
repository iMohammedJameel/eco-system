const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/notification.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const {
  createNotificationSchema,
  updateNotificationSchema,
} = require("../controllers/validation/notificationValidation");

router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllNotifications);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getNotificationById);
router.post(
  "/",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(createNotificationSchema),
  createNotification,
);
router.put(
  "/:id",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(updateNotificationSchema),
  updateNotification,
);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteNotification);


// ═══════════ توثيق Swagger — الإشعارات ═══════════
/**
 * @openapi
 * /dashboard/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: كل الإشعارات (ترقيم + فلاتر)
 *     responses:
 *       200: { description: قائمة الإشعارات }
 */
/**
 * @openapi
 * /dashboard/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: بث إشعار (لمستخدم محدد أو للجميع)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message, recipient]
 *             properties:
 *               title: { type: string }
 *               message: { type: string }
 *               type: { type: string, enum: [earnings, machine_alert, promo, system, issue] }
 *               recipient: { description: "'all' أو معرّف المستخدم" }
 *     responses:
 *       201: { description: تم البث }
 */
/**
 * @openapi
 * /dashboard/notifications/{id}:
 *   put:
 *     tags: [Notifications]
 *     summary: تعديل إشعار
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التعديل }
 */
/**
 * @openapi
 * /dashboard/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: حذف إشعار (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */

module.exports = router;
