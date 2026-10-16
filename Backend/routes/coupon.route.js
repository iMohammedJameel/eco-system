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

module.exports = router;
