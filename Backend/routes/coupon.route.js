const express = require("express");
const router = express.Router();
const {
  issueCoupon,
  getAllCoupons,
  getPartnerCoupons,
  getMyCoupons,
  redeemCoupon,
  cancelCoupon,
} = require("../controllers/coupon.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const validationSchema = require("../middleware/validationSchema");
const { issueCouponSchema } = require("../controllers/validation/couponValidation");

// أدمن — إدارة الكوبونات
router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getAllCoupons);
router.post(
  "/",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  validationSchema(issueCouponSchema),
  issueCoupon,
);
router.patch(
  "/redeem",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  redeemCoupon,
);
router.delete(
  "/:id",
  verifyToken,
  allowedTo("superAdmin"),
  cancelCoupon,
);

// بوابة الشريك — كوبونات شريك محدد
router.get(
  "/partner/:partnerId",
  verifyToken,
  allowedTo("superAdmin", "operationsManager"),
  getPartnerCoupons,
);

// المستخدم (تطبيق الموبايل مستقبلًا)
router.get("/my", verifyToken, allowedTo("user"), getMyCoupons);


// ═══════════ توثيق Swagger — الكوبونات ═══════════
/**
 * @openapi
 * /dashboard/coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: كل الكوبونات (فلاتر + ترقيم + إحصائيات)
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: status, in: query, schema: { type: string, enum: [issued, redeemed, cancelled] } }
 *       - { name: partnerId, in: query, schema: { type: string } }
 *       - { name: userId, in: query, schema: { type: string } }
 *     responses:
 *       200: { description: كوبونات + stats (issued/redeemed/totalPoints) }
 */
/**
 * @openapi
 * /dashboard/coupons:
 *   post:
 *     tags: [Coupons]
 *     summary: إصدار كوبون — استبدال رصيد المستخدم بخصم عند شريك
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, partnerId, pointsCost]
 *             properties:
 *               userId: { type: string }
 *               partnerId: { type: string }
 *               offerTitle: { type: string }
 *               pointsCost: { type: number, example: 50 }
 *               validityDays: { type: integer, example: 30 }
 *     responses:
 *       201: { description: الكوبون + الرصيد الجديد }
 *       400: { description: الرصيد غير كافٍ }
 */
/**
 * @openapi
 * /dashboard/coupons/redeem:
 *   patch:
 *     tags: [Coupons]
 *     summary: تأكيد استبدال كوبون (أدمن — ذرّي + فحص صلاحية)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, example: ECO-A1B2C3D4 }
 *     responses:
 *       200: { description: تم الاستبدال }
 *       400: { description: منتهي الصلاحية أو مستبدل }
 *       404: { description: الكوبون غير موجود }
 */
/**
 * @openapi
 * /dashboard/coupons/{id}:
 *   delete:
 *     tags: [Coupons]
 *     summary: إلغاء كوبون + إرجاع النقاط للمستخدم (superAdmin)
 *     parameters:
 *       - { name: id, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الإلغاء وإرجاع النقاط }
 */
/**
 * @openapi
 * /dashboard/coupons/partner/{partnerId}:
 *   get:
 *     tags: [Coupons]
 *     summary: كوبونات شريك محدد (أدمن)
 *     parameters:
 *       - { name: partnerId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: آخر 50 كوبون للشريك }
 */
/**
 * @openapi
 * /dashboard/coupons/my:
 *   get:
 *     tags: [Coupons (User)]
 *     summary: كوبوناتي (المواطن)
 *     responses:
 *       200: { description: كوبونات المستخدم + serverTime }
 */

module.exports = router;
