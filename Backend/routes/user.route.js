const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/user.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createUserSchema, updateUserSchema } = require("../controllers/validation/userValidation");

/**
 * @openapi
 * /dashboard/users:
 *   get:
 *     tags: [Users]
 *     summary: كل المستخدمين (بحث + ترقيم صفحات)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 } }
 *       - { name: limit, in: query, schema: { type: integer, default: 10 } }
 *       - { name: search, in: query, schema: { type: string }, description: بحث بالاسم/البريد/الهاتف }
 *     responses:
 *       200: { description: قائمة المستخدمين + pagination }
 */
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllUsers);

/**
 * @openapi
 * /dashboard/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: مستخدم بالمعرّف
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: بيانات المستخدم }
 *       404: { description: غير موجود }
 */
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getUserById);

/**
 * @openapi
 * /dashboard/users:
 *   post:
 *     tags: [Users]
 *     summary: إنشاء مستخدم (superAdmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, phoneNumber, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               phoneNumber: { type: string, example: "01000000001" }
 *               password: { type: string }
 *     responses:
 *       201: { description: تم الإنشاء }
 *       400: { description: بريد/هاتف مكرر }
 */
router.post("/", verifyToken, allowedTo("superAdmin"), validationSchema(createUserSchema), createUser);

/**
 * @openapi
 * /dashboard/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: تعديل مستخدم (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التعديل }
 */
router.put("/:id", verifyToken, allowedTo("superAdmin"), validationSchema(updateUserSchema), updateUser);

/**
 * @openapi
 * /dashboard/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: حذف مستخدم + تنظيف كل بياناته المرتبطة (cascade)
 *     description: يحذف المعاملات والكوبونات والبلاغات والإشعارات وجلسات QR المرتبطة.
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف مع عدّادات ما تم تنظيفه }
 *       404: { description: غير موجود }
 */
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteUser);

module.exports = router;
