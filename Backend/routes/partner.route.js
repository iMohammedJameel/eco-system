const express = require("express");
const router = express.Router();
const {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  addPartnerOffer,
  updatePartnerOffer,
  deletePartnerOffer,
} = require("../controllers/partner.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { createPartnerSchema, updatePartnerSchema, discountOfferSchema, updateDiscountOfferSchema } = require("../controllers/validation/partnerValidation");

// Admin only — partner management is restricted
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllPartners);
router.get("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), getPartnerById);
router.post("/", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(createPartnerSchema), createPartner);
router.put("/:id", verifyToken, allowedTo("superAdmin", "operationsManager"), validationSchema(updatePartnerSchema), updatePartner);
router.delete("/:id", verifyToken, allowedTo("superAdmin"), deletePartner);

// عروض الخصومات — عمليات ذرّية على عنصر واحد (تمنع lost updates)
router.post(
  "/:id/offers",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(discountOfferSchema),
  addPartnerOffer,
);
router.patch(
  "/:id/offers/:offerId",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(updateDiscountOfferSchema),
  updatePartnerOffer,
);
router.delete(
  "/:id/offers/:offerId",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  deletePartnerOffer,
);


// ═══════════ توثيق Swagger — الشركاء ═══════════
/**
 * @openapi
 * /dashboard/partners:
 *   get:
 *     tags: [Partners]
 *     summary: كل الشركاء (فلاتر + بحث + ترقيم)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: isActive, in: query, schema: { type: string, enum: ["true", "false"] } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: قائمة الشركاء + pagination }
 */
/**
 * @openapi
 * /dashboard/partners/{id}:
 *   get:
 *     tags: [Partners]
 *     summary: شريك بالمعرّف
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: بيانات الشريك }
 *       404: { description: غير موجود }
 */
/**
 * @openapi
 * /dashboard/partners:
 *   post:
 *     tags: [Partners]
 *     summary: إنشاء شريك (مع كلمة مرور اختيارية لبوابة الشركاء)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Kazyon }
 *               category: { type: string, enum: [supermarket, electronics, pharmacy, fashion, food, services, other] }
 *               contactEmail: { type: string }
 *               contactPhone: { type: string }
 *               password: { type: string, description: كلمة مرور بوابة الشركاء (اختيارية) }
 *               governorate: { type: string }
 *     responses:
 *       201: { description: تم الإنشاء }
 *       400: { description: الاسم موجود بالفعل }
 */
/**
 * @openapi
 * /dashboard/partners/{id}:
 *   put:
 *     tags: [Partners]
 *     summary: تعديل شريك (تهاش كلمة المرور لو أُرسلت)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم التعديل }
 */
/**
 * @openapi
 * /dashboard/partners/{id}:
 *   delete:
 *     tags: [Partners]
 *     summary: حذف شريك + إرجاع نقاط الكوبونات النشطة + تنظيف سجلاته
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: عدّادات الاسترجاع والتنظيف }
 */
/**
 * @openapi
 * /dashboard/partners/{id}/offers:
 *   post:
 *     tags: [Partners]
 *     summary: إضافة عرض خصم (ذرّي — $push)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       201: { description: العرض المضاف }
 */
/**
 * @openapi
 * /dashboard/partners/{id}/offers/{offerId}:
 *   patch:
 *     tags: [Partners]
 *     summary: تعديل عرض واحد (arrayFilters — بدون لمس باقي العروض)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *       - { name: offerId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: العرض المعدّل }
 */
/**
 * @openapi
 * /dashboard/partners/{id}/offers/{offerId}:
 *   delete:
 *     tags: [Partners]
 *     summary: حذف عرض واحد ($pull)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *       - { name: offerId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */

module.exports = router;
