const express = require("express");
const router = express.Router();
const { getAllMachines, getMachineById, createMachine, updateMachine, deleteMachine } = require("../controllers/machine.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createMachineSchema, updateMachineSchema } = require("../controllers/validation/machineValidation");

// Users and admins can view machines
router.get("/", verifyToken, getAllMachines);
router.get("/:id", verifyToken, getMachineById);

// Admin only
router.post("/", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(createMachineSchema), createMachine);
router.put("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(updateMachineSchema), updateMachine);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deleteMachine);


// ═══════════ توثيق Swagger — الماكينات ═══════════
/**
 * @openapi
 * /dashboard/machines:
 *   get:
 *     tags: [Machines]
 *     summary: كل الماكينات (جميع الأدوار المصادق عليها)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: status, in: query, schema: { type: string, enum: [active, maintenance, offline, nearlyFull] } }
 *       - { name: governorate, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: قائمة الماكينات + pagination }
 */
/**
 * @openapi
 * /dashboard/machines/{id}:
 *   get:
 *     tags: [Machines]
 *     summary: ماكينة بالمعرّف
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: بيانات الماكينة }
 */
/**
 * @openapi
 * /dashboard/machines:
 *   post:
 *     tags: [Machines]
 *     summary: إنشاء ماكينة (أدمن)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, governorate]
 *             properties:
 *               name: { type: string, example: "ماكينة مدينة نصر 1" }
 *               location: { type: string }
 *               governorate: { type: string, example: القاهرة }
 *               latitude: { type: number, example: 30.0566 }
 *               longitude: { type: number, example: 31.3302 }
 *               capacityKg: { type: number, example: 500 }
 *     responses:
 *       201: { description: تم الإنشاء }
 */
/**
 * @openapi
 * /dashboard/machines/{id}:
 *   put:
 *     tags: [Machines]
 *     summary: تعديل ماكينة (أدمن)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التعديل }
 */
/**
 * @openapi
 * /dashboard/machines/{id}:
 *   delete:
 *     tags: [Machines]
 *     summary: حذف ماكينة (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */

module.exports = router;
