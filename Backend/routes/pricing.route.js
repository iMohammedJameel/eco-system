const express = require("express");
const router = express.Router();
const {
  getAllPricing,
  getPricingById,
  createPricing,
  updatePricing,
  deletePricing,
} = require("../controllers/pricing.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createPricingSchema, updatePricingSchema } = require("../controllers/validation/pricingValidation");

// Admin only — pricing is operational configuration
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllPricing);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getPricingById);
router.post("/", verifyToken, allowedTo("superAdmin"), validationSchema(createPricingSchema), createPricing);
router.put("/:id", verifyToken, allowedTo("superAdmin"), validationSchema(updatePricingSchema), updatePricing);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deletePricing);


// ═══════════ توثيق Swagger — الأسعار ═══════════
/**
 * @openapi
 * /dashboard/pricing:
 *   get:
 *     tags: [Pricing]
 *     summary: كل تسعيرات الخامات
 *     responses:
 *       200: { description: قائمة التسعير }
 */
/**
 * @openapi
 * /dashboard/pricing:
 *   post:
 *     tags: [Pricing]
 *     summary: إنشاء تسعيرة خام (superAdmin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [materialType, pricePerKg]
 *             properties:
 *               materialType: { type: string, enum: [plastic, glass, cardboard, paper] }
 *               pricePerKg: { type: number, example: 5 }
 *     responses:
 *       201: { description: تم الإنشاء }
 */
/**
 * @openapi
 * /dashboard/pricing/{id}:
 *   put:
 *     tags: [Pricing]
 *     summary: تعديل تسعيرة (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التعديل }
 */
/**
 * @openapi
 * /dashboard/pricing/{id}:
 *   delete:
 *     tags: [Pricing]
 *     summary: حذف تسعيرة (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */

module.exports = router;
