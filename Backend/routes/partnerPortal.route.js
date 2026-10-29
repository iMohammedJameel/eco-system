/**
 * مسارات بوابة الشركاء — /api/partner-portal
 * عام: login / refresh / logout (الـ refresh cookie مربوطة بهذا المسار)
 * محمي (role=partner): me / coupons / redeem / offers
 */
const express = require("express");
const router = express.Router();
const { loginPartner, refreshPartnerToken, logoutPartner } = require("../controllers/authPartner.controller");
const {
  getPartnerMe,
  getMyPartnerCoupons,
  redeemCouponAsPartner,
  addMyOffer,
  updateMyOffer,
  deleteMyOffer,
} = require("../controllers/partnerPortal.controller");
const validationSchema = require("../middleware/validationSchema");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
const {
  partnerLoginSchema,
  discountOfferSchema,
  updateDiscountOfferSchema,
} = require("../controllers/validation/partnerValidation");

/**
 * @openapi
 * /partner-portal/login:
 *   post:
 *     tags: [Partner Portal]
 *     summary: تسجيل دخول الشريك (بوابة الشركاء الحقيقية)
 *     description: الدخول ببريد التواصل وكلمة المرور — يصدر JWT بدور partner.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: kazyon@partner.ecocycle.com }
 *               password: { type: string, example: partner123456 }
 *               remember: { type: boolean }
 *     responses:
 *       200: { description: access token + refresh cookie }
 *       400: { description: بيانات غير صحيحة }
 *       403: { description: الحساب معطّل أو الدخول غير مفعّل }
 *       423: { description: الحساب مقفول مؤقتًا }
 */
router.post("/login", validationSchema(partnerLoginSchema), loginPartner);

/**
 * @openapi
 * /partner-portal/refresh:
 *   post:
 *     tags: [Partner Portal]
 *     summary: تجديد access token للشريك
 *     security: []
 *     responses:
 *       200: { description: access token جديد }
 *       401: { description: الجلسة منتهية }
 */
router.post("/refresh", refreshPartnerToken);

/**
 * @openapi
 * /partner-portal/logout:
 *   post:
 *     tags: [Partner Portal]
 *     summary: تسجيل خروج الشريك — مسح الـ refresh cookie
 *     security: []
 *     responses:
 *       200: { description: تم تسجيل الخروج }
 */
router.post("/logout", logoutPartner);

/**
 * @openapi
 * /partner-portal/me:
 *   get:
 *     tags: [Partner Portal]
 *     summary: بروفايل الشريك + إحصائيات كوبوناته
 *     responses:
 *       200:
 *         description: البروفايل + إحصائيات (نشطة/مستبدلة/منتهية + النقاط)
 *       404: { description: حساب الشريك غير موجود }
 */
router.get("/me", verifyToken, allowedTo("partner"), getPartnerMe);

/**
 * @openapi
 * /partner-portal/coupons:
 *   get:
 *     tags: [Partner Portal]
 *     summary: كوبونات الشريك نفسه (آخر 100)
 *     responses:
 *       200: { description: قائمة الكوبونات مع بيانات المستخدم }
 */
router.get("/coupons", verifyToken, allowedTo("partner"), getMyPartnerCoupons);

/**
 * @openapi
 * /partner-portal/redeem:
 *   patch:
 *     tags: [Partner Portal]
 *     summary: استبدال كوبون (للشريك صاحب الكوبون فقط)
 *     description: عملية ذرّية — ترفض الكوبونات المنتهية الصلاحية وكوبونات الشركاء الآخرين.
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
 *       400: { description: منتهي الصلاحية أو مستبدل سابقًا }
 *       403: { description: كوبون شريك آخر }
 *       404: { description: الكوبون غير موجود }
 */
router.patch("/redeem", verifyToken, allowedTo("partner"), redeemCouponAsPartner);

/**
 * @openapi
 * /partner-portal/offers:
 *   post:
 *     tags: [Partner Portal]
 *     summary: إضافة عرض خصم جديد (على سجل الشريك نفسه)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, discountValue]
 *             properties:
 *               title: { type: string, example: "خصم 10% على البقالة" }
 *               description: { type: string }
 *               discountType: { type: string, enum: [percentage, fixed] }
 *               discountValue: { type: number, example: 10 }
 *               minSpend: { type: number }
 *               validUntil: { type: string, format: date }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: تمت الإضافة }
 */
router.post("/offers", verifyToken, allowedTo("partner"), validationSchema(discountOfferSchema), addMyOffer);

/**
 * @openapi
 * /partner-portal/offers/{offerId}:
 *   patch:
 *     tags: [Partner Portal]
 *     summary: تعديل عرض (للشريك نفسه)
 *     parameters:
 *       - { name: offerId, in: path, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               discountValue: { type: number }
 *               isActive: { type: boolean }
 *     responses:
 *       200: { description: تم التعديل }
 *       404: { description: العرض غير موجود }
 */
router.patch("/offers/:offerId", verifyToken, allowedTo("partner"), validationSchema(updateDiscountOfferSchema), updateMyOffer);

/**
 * @openapi
 * /partner-portal/offers/{offerId}:
 *   delete:
 *     tags: [Partner Portal]
 *     summary: حذف عرض (للشريك نفسه)
 *     parameters:
 *       - { name: offerId, in: path, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: تم الحذف }
 */
router.delete("/offers/:offerId", verifyToken, allowedTo("partner"), deleteMyOffer);

module.exports = router;
