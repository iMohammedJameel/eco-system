// Require Express
const express = require("express");
// Router
const router = express.Router();
// Require Controller
const { registerUser, loginUser, refreshUserToken, logoutUser, getMe, getMyWallet, updateMe, changePassword } = require("../controllers/authUser.controller");
const validationSchema = require("../middleware/validationSchema");
const { registerSchema, loginSchema } = require("../controllers/validation/authUserValidation");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth (User)]
 *     summary: تسجيل مواطن جديد
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, phoneNumber, password]
 *             properties:
 *               username: { type: string, example: "أحمد محمود" }
 *               email: { type: string, example: user1@ecocycle.com }
 *               phoneNumber: { type: string, example: "01000000001" }
 *               password: { type: string, example: user123456 }
 *     responses:
 *       201: { description: تم إنشاء الحساب }
 *       400: { description: بريد أو هاتف مسجّل بالفعل }
 */
router.post("/register", validationSchema(registerSchema), registerUser);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth (User)]
 *     summary: تسجيل دخول المواطن (بوابة المواطن)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: user1@ecocycle.com }
 *               password: { type: string, example: user123456 }
 *               remember: { type: boolean }
 *     responses:
 *       200: { description: access token + refresh cookie }
 *       423: { description: الحساب مقفول مؤقتًا }
 */
router.post("/login", validationSchema(loginSchema), loginUser);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth (User)]
 *     summary: تجديد access token للمواطن
 *     security: []
 *     responses:
 *       200: { description: access token جديد }
 *       401: { description: الجلسة منتهية }
 */
router.post("/refresh", refreshUserToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth (User)]
 *     summary: تسجيل خروج المواطن — مسح الـ refresh cookie
 *     security: []
 *     responses:
 *       200: { description: تم تسجيل الخروج }
 */
router.post("/logout", logoutUser);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth (User)]
 *     summary: بروفايل المواطن الحالي
 *     responses:
 *       200: { description: بيانات المستخدم }
 *       404: { description: المستخدم غير موجود }
 */
router.get("/me", verifyToken, allowedTo("user"), getMe);

/**
 * @openapi
 * /auth/wallet:
 *   get:
 *     tags: [Auth (User)]
 *     summary: ملخص محفظة المواطن (رصيد + إحصائيات + آخر المعاملات + إنجازات)
 *     responses:
 *       200:
 *         description: ملخص المحفظة كاملًا في طلب واحد
 *       404: { description: المستخدم غير موجود }
 */
router.get("/wallet", verifyToken, allowedTo("user"), getMyWallet);

/**
 * @openapi
 * /auth/me:
 *   put:
 *     tags: [Auth (User)]
 *     summary: تحديث بيانات المواطن (الاسم / الهاتف)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               phoneNumber: { type: string, example: "01000000001" }
 *     responses:
 *       200: { description: تم التحديث }
 *       400: { description: الهاتف مسجّل لحساب آخر }
 */
router.put("/me", verifyToken, allowedTo("user"), updateMe);

/**
 * @openapi
 * /auth/me/change-password:
 *   put:
 *     tags: [Auth (User)]
 *     summary: تغيير كلمة مرور المواطن
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: تم التحديث }
 *       400: { description: كلمة المرور الحالية غير صحيحة }
 */
router.put("/me/change-password", verifyToken, allowedTo("user"), changePassword);
// Export
module.exports = router;
