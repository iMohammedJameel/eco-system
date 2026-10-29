// Require Express
const express = require("express");
// Router
const router = express.Router();
// Require Controller
const { loginAdmin, refreshAdminToken, logoutAdmin, forgotPassword, resetPassword } = require("../controllers/authAdmin.controller");
const validationSchema = require("../middleware/validationSchema");
const { loginSchema, forgotSchema, resetSchema } = require("../controllers/validation/authAdminValidation");
const verifyToken = require("../middleware/verifyToken");

/**
 * @openapi
 * /dashboard/login:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: تسجيل دخول الأدمن (superAdmin / operationsManager)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@ecocycle.com }
 *               password: { type: string, example: admin123456 }
 *               remember: { type: boolean, example: true }
 *     responses:
 *       200:
 *         description: access token + httpOnly refresh cookie
 *       400: { description: بيانات غير صحيحة }
 *       423: { description: الحساب مقفول مؤقتًا }
 */
router.post("/login", validationSchema(loginSchema), loginAdmin);

/**
 * @openapi
 * /dashboard/refresh:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: تجديد access token من الـ refresh cookie
 *     security: []
 *     responses:
 *       200: { description: access token جديد }
 *       401: { description: الجلسة منتهية }
 */
router.post("/refresh", refreshAdminToken);

/**
 * @openapi
 * /dashboard/forgot-password:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: طلب توكن استعادة كلمة المرور (تحقق مزدوج بالبريد والاسم/الهاتف)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, verify]
 *             properties:
 *               email: { type: string, example: admin@ecocycle.com }
 *               verify: { type: string, example: "admin / 01000000000" }
 *     responses:
 *       200: { description: reset token (صالح 15 دقيقة) }
 */
router.post("/forgot-password", validationSchema(forgotSchema), forgotPassword);

/**
 * @openapi
 * /dashboard/reset-password:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: تعيين كلمة مرور جديدة بتوكن الاستعادة
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resetToken, newPassword]
 *             properties:
 *               resetToken: { type: string }
 *               newPassword: { type: string, example: "newPass123456" }
 *     responses:
 *       200: { description: تم التحديث }
 *       400: { description: توكن غير صالح }
 */
router.post("/reset-password", validationSchema(resetSchema), resetPassword);

/**
 * @openapi
 * /dashboard/logout:
 *   post:
 *     tags: [Auth (Admin)]
 *     summary: تسجيل خروج — مسح الـ refresh cookie
 *     security: []
 *     responses:
 *       200: { description: تم تسجيل الخروج }
 */
router.post("/logout", logoutAdmin);

// Export
module.exports = router;
