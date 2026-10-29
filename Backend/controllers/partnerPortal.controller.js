/**
 * عمليات بوابة الشركاء (الشريك المسجّل دخوله — role=partner)
 * كل عملية مقيّدة بسجل الشريك نفسه (req.user.id) —
 * الشريك لا يرى ولا يعدّل إلا بياناته وعروضه وكوبوناته.
 */
const Partner = require("../models/Partner");
const Coupon = require("../models/Coupon");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");
// إعادة استخدام منطق الأدمن الجاهز للعروض (بدون تكرار كود)
const {
  addPartnerOffer,
  updatePartnerOffer,
  deletePartnerOffer,
} = require("./partner.controller");

/** بروفايل الشريك الآمن للواجهة (بدون أي بيانات حساسة) */
const toSafeProfile = (partner) => ({
  id: partner._id,
  name: partner.name,
  category: partner.category,
  logo: partner.logo,
  contactEmail: partner.contactEmail,
  contactPhone: partner.contactPhone,
  website: partner.website,
  address: partner.address,
  governorate: partner.governorate,
  discountOffers: partner.discountOffers,
  isActive: partner.isActive,
});

/** بروفايل الشريك الحالي + إحصائيات كوبوناته */
const getPartnerMe = asyncWrapper(async (req, res, next) => {
  const partner = await Partner.findById(req.user.id);
  if (!partner) return next(appError.create("حساب الشريك غير موجود", 404, ERROR));

  const [active, redeemed, expired, redeemedPoints] = await Promise.all([
    Coupon.countDocuments({ partner: partner._id, status: "issued", expiresAt: { $gt: new Date() } }),
    Coupon.countDocuments({ partner: partner._id, status: "redeemed" }),
    Coupon.countDocuments({ partner: partner._id, status: "issued", expiresAt: { $lte: new Date() } }),
    Coupon.aggregate([
      { $match: { partner: partner._id, status: "redeemed" } },
      { $group: { _id: null, points: { $sum: "$pointsCost" } } },
    ]),
  ]);

  res.status(200).json({
    status: SUCCESS,
    data: {
      partner: toSafeProfile(partner),
      stats: {
        activeCoupons: active,
        redeemedCoupons: redeemed,
        expiredCoupons: expired,
        redeemedPoints: redeemedPoints[0]?.points || 0,
      },
    },
  });
});

/** كوبونات الشريك نفسه — للاستبدال عند الكاشير */
const getMyPartnerCoupons = asyncWrapper(async (req, res) => {
  const coupons = await Coupon.find({ partner: req.user.id })
    .populate("user", "username phoneNumber")
    .sort({ createdAt: -1 })
    .limit(100);
  res.status(200).json({ status: SUCCESS, data: coupons, serverTime: new Date() });
});

/**
 * استبدال كوبون — الشريك يستبدل كوبوناته فقط (وليس كوبونات شركاء آخرين)
 * ذرّي: status issued → redeemed مرة واحدة + فحص انتهاء الصلاحية
 */
const redeemCouponAsPartner = asyncWrapper(async (req, res, next) => {
  const { code } = req.body;

  // القيد الجوهري: الكوبون لازم يكون لهذا الشريك تحديدًا
  const coupon = await Coupon.findOneAndUpdate(
    { code, partner: req.user.id, status: "issued", expiresAt: { $gt: new Date() } },
    {
      $set: {
        status: "redeemed",
        redeemedAt: new Date(),
        redeemedByPartner: req.user.id,
      },
    },
    { returnDocument: "after" },
  )
    .populate("user", "username phoneNumber")
    .populate("partner", "name");

  if (!coupon) {
    const exists = await Coupon.findOne({ code });
    if (!exists) return next(appError.create("الكوبون غير موجود", 404, ERROR));
    if (String(exists.partner) !== String(req.user.id))
      return next(appError.create("هذا الكوبون يخص شريكًا آخر — لا يمكنك استبداله", 403, ERROR));
    if (exists.status === "issued" && exists.expiresAt <= new Date())
      return next(appError.create("انتهت صلاحية هذا الكوبون — لا يمكن استبداله", 400, ERROR));
    return next(appError.create("الكوبون مستبدل أو ملغي بالفعل", 400, ERROR));
  }

  logAudit(req, {
    action: "coupon.redeem.partner",
    targetType: "coupon",
    targetId: coupon._id,
    targetLabel: `${code} @ ${coupon.partner?.name || "—"}`,
    meta: { by: "partner" },
  });

  res.status(200).json({ status: SUCCESS, data: coupon });
});

/* ═══ إدارة العروض — إعادة استخدام كونترولر الأدمن مع تقييد السجل ═══
  الدوال في partner.controller تشتغل على req.params.id —
  هنا بنثبّت الـ id على سجل الشريك نفسه قبل النداء،
  فالشريك يعدّل عروضه هو فقط مهما أرسل في الطلب. */

const addMyOffer = asyncWrapper(async (req, res, next) => {
  req.params.id = String(req.user.id);
  return addPartnerOffer(req, res, next);
});

const updateMyOffer = asyncWrapper(async (req, res, next) => {
  req.params.id = String(req.user.id);
  return updatePartnerOffer(req, res, next);
});

const deleteMyOffer = asyncWrapper(async (req, res, next) => {
  req.params.id = String(req.user.id);
  return deletePartnerOffer(req, res, next);
});

module.exports = {
  getPartnerMe,
  getMyPartnerCoupons,
  redeemCouponAsPartner,
  addMyOffer,
  updateMyOffer,
  deleteMyOffer,
};
