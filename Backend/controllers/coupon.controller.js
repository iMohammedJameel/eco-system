const Coupon = require("../models/Coupon");
const User = require("../models/User");
const Partner = require("../models/Partner");
const Transaction = require("../models/Transaction");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const crypto = require("crypto");
const { logAudit } = require("../utils/audit");

const COUPON_TTL_DAYS = 30;

const generateCode = () =>
  "ECO-" + crypto.randomBytes(4).toString("hex").toUpperCase();

/**
 * إصدار كوبون — الأدمن يستبدل رصيد المستخدم بكوبون خصم عند شريك
 * الخصم ذرّي: لو الرصيد غير كافٍ لا يتغير أي شيء
 */
const issueCoupon = asyncWrapper(async (req, res, next) => {
  const { userId, partnerId, offerTitle, pointsCost, validityDays } = req.body;

  const [user, partner] = await Promise.all([
    User.findById(userId),
    Partner.findById(partnerId),
  ]);
  if (!user) return next(appError.create("المستخدم غير موجود", 404, ERROR));
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  if (!user.isActive) return next(appError.create("حساب المستخدم معطّل", 400, ERROR));
  if (!partner.isActive) return next(appError.create("الشريك غير مفعّل حاليًا", 400, ERROR));

  // snapshot العرض
  const offer = partner.discountOffers?.find((o) => o.title === offerTitle) ||
    partner.discountOffers?.[0] || {
      title: "خصم من الشريك",
      discountType: "percentage",
      discountValue: 10,
      minSpend: 0,
    };

  // خصم ذرّي من رصيد المستخدم
  const updated = await User.findOneAndUpdate(
    { _id: userId, balance: { $gte: pointsCost } },
    { $inc: { balance: -pointsCost } },
    { new: true },
  );
  if (!updated)
    return next(appError.create("الرصيد غير كافٍ لاستبدال هذا الكوبون", 400, ERROR));

  const days = validityDays || COUPON_TTL_DAYS;

  // كود فريد
  let code = generateCode();
  for (let i = 0; i < 3; i++) {
    const exists = await Coupon.exists({ code });
    if (!exists) break;
    code = generateCode();
  }

  const coupon = await Coupon.create({
    code,
    user: userId,
    partner: partnerId,
    offer: {
      title: offer.title,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minSpend: offer.minSpend || 0,
    },
    pointsCost,
    issuedBy: req.user.id,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });

  // قيد مالي في دفتر المعاملات
  const transaction = await Transaction.create({
    user: userId,
    type: "withdrawal",
    amount: pointsCost,
    withdrawalMethod: "coupon",
    accountNumber: code,
  });

  logAudit(req, {
    action: "coupon.issue",
    targetType: "coupon",
    targetId: coupon._id,
    targetLabel: `${code} → ${user.username} @ ${partner.name}`,
    meta: { pointsCost, offer: offer.title },
  });

  res.status(201).json({
    status: SUCCESS,
    data: { coupon, newBalance: Math.round(updated.balance * 100) / 100, transactionId: transaction._id },
  });
});

// كل الكوبونات (أدمن) مع فلاتر
const getAllCoupons = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.partnerId) filter.partner = req.query.partnerId;
  if (req.query.userId) filter.user = req.query.userId;

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .populate("user", "username email phoneNumber")
      .populate("partner", "name category logo")
      .populate("issuedBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Coupon.countDocuments(filter),
  ]);

  // إحصائيات سريعة
  const [issued, redeemed, totalPoints] = await Promise.all([
    Coupon.countDocuments({ status: "issued" }),
    Coupon.countDocuments({ status: "redeemed" }),
    Coupon.aggregate([
      { $group: { _id: null, points: { $sum: "$pointsCost" } } },
    ]),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    stats: { issued, redeemed, totalPoints: totalPoints[0]?.points || 0 },
    data: coupons,
  });
});

// كوبونات شريك معين (بوابة الشريك)
const getPartnerCoupons = asyncWrapper(async (req, res) => {
  const { partnerId } = req.params;

  const coupons = await Coupon.find({ partner: partnerId })
    .populate("user", "username phoneNumber")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ status: SUCCESS, data: coupons });
});

// كوبونات المستخدم نفسه (تطبيق الموبايل مستقبلًا)
const getMyCoupons = asyncWrapper(async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({ user: req.user.id })
    .populate("partner", "name category logo")
    .sort({ createdAt: -1 });
  res.status(200).json({ status: SUCCESS, data: coupons, serverTime: now });
});

/**
 * تأكيد استبدال الكوبون عند الشريك
 * atomic: status issued → redeemed فقط مرة واحدة
 */
const redeemCoupon = asyncWrapper(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOneAndUpdate(
    { code, status: "issued" },
    {
      $set: {
        status: "redeemed",
        redeemedAt: new Date(),
        redeemedBy: req.user.id,
      },
    },
    { new: true },
  )
    .populate("user", "username phoneNumber")
    .populate("partner", "name");

  if (!coupon) {
    const exists = await Coupon.findOne({ code });
    if (!exists) return next(appError.create("الكوبون غير موجود", 404, ERROR));
    return next(appError.create("الكوبون مستبدل أو ملغي بالفعل", 400, ERROR));
  }

  logAudit(req, {
    action: "coupon.redeem",
    targetType: "coupon",
    targetId: coupon._id,
    targetLabel: `${code} @ ${coupon.partner?.name || "—"}`,
  });

  res.status(200).json({ status: SUCCESS, data: coupon });
});

// إلغاء كوبون + إرجاع النقاط للمستخدم (superAdmin فقط)
const cancelCoupon = asyncWrapper(async (req, res, next) => {
  const coupon = await Coupon.findOneAndUpdate(
    { _id: req.params.id, status: "issued" },
    { $set: { status: "cancelled" } },
    { new: true },
  );
  if (!coupon) return next(appError.create("الكوبون غير موجود أو لم يُصدر بعد", 404, ERROR));

  // إرجاع النقاط
  await User.updateOne({ _id: coupon.user }, { $inc: { balance: coupon.pointsCost } });

  logAudit(req, {
    action: "coupon.cancel",
    targetType: "coupon",
    targetId: coupon._id,
    targetLabel: coupon.code,
    meta: { refunded: coupon.pointsCost },
  });

  res.status(200).json({ status: SUCCESS, data: coupon });
});

module.exports = {
  issueCoupon,
  getAllCoupons,
  getPartnerCoupons,
  getMyCoupons,
  redeemCoupon,
  cancelCoupon,
};
