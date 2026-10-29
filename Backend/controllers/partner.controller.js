const Partner = require("../models/Partner");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");
const { searchQuery } = require("../utils/searchHelpers");
const bcrypt = require("bcrypt");

const getAllPartners = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  // بحث من السيرفر — يعمل عبر كل الصفحات مش الصفحة المعروضة فقط
  if (req.query.search) {
    Object.assign(filter, searchQuery(["name", "contactEmail", "contactPhone", "governorate"], req.query.search));
  }

  const [partners, total] = await Promise.all([
    Partner.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Partner.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: partners,
  });
});

const getPartnerById = asyncWrapper(async (req, res, next) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: partner });
});

const createPartner = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;
  const existPartner = await Partner.findOne({ name });
  if (existPartner) return next(appError.create("اسم الشريك موجود بالفعل", 400, ERROR));

  const partner = await Partner.create(req.body);
  logAudit(req, { action: "partner.create", targetType: "partner", targetId: partner._id, targetLabel: partner.name });
  res.status(201).json({ status: SUCCESS, data: partner });
});

const updatePartner = asyncWrapper(async (req, res, next) => {
  const { password, ...restBody } = req.body;

  // findByIdAndUpdate لا يشغّل pre('save') — نهاش كلمة المرور يدويًا
  const update = { ...restBody };
  if (password) update.password = await bcrypt.hash(password, 10);

  const partner = await Partner.findByIdAndUpdate(req.params.id, update, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  logAudit(req, {
    action: "partner.update", targetType: "partner", targetId: partner._id, targetLabel: partner.name,
    meta: { isActive: partner.isActive, passwordChanged: Boolean(password) },
  });
  res.status(200).json({ status: SUCCESS, data: partner });
});

/**
 * حذف شريك — مع إرجاع نقاط الكوبونات النشطة لأصحابها وتنظيف سجلاته
 * (قبل الإصلاح: الحذف كان يترك كوبونات يتيمة والمستخدمين يخسروا نقاطهم)
 */
const deletePartner = asyncWrapper(async (req, res, next) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));

  // إرجاع نقاط الكوبونات النشطة لمستخدميها (مجمّعة لتحديث واحد لكل مستخدم)
  const refunds = await Coupon.aggregate([
    { $match: { partner: partner._id, status: "issued" } },
    { $group: { _id: "$user", refund: { $sum: "$pointsCost" } } },
  ]);
  await Promise.all(
    refunds.map((r) => User.updateOne({ _id: r._id }, { $inc: { balance: r.refund } })),
  );

  const removedCoupons = await Coupon.deleteMany({ partner: partner._id });
  await Partner.deleteOne({ _id: partner._id });

  logAudit(req, {
    action: "partner.delete",
    targetType: "partner",
    targetId: partner._id,
    targetLabel: partner.name,
    meta: {
      refundedUsers: refunds.length,
      refundedPoints: refunds.reduce((s, r) => s + r.refund, 0),
      removedCoupons: removedCoupons.deletedCount,
    },
  });

  res.status(200).json({
    status: SUCCESS,
    msg: "تم حذف الشريك بنجاح",
    data: {
      refundedUsers: refunds.length,
      refundedPoints: refunds.reduce((s, r) => s + r.refund, 0),
      removedCoupons: removedCoupons.deletedCount,
    },
  });
});

/* ═══════════ عروض الخصومات — عمليات ذرّية على عنصر واحد ═══════════
  كانت البوابة ترسل الـ array كله عبر PUT (read-modify-write) —
  أي تعديلين متزامنين يفقد أحدهما. العمليات دي على العنصر نفسه:
  $push / arrayFilters / $pull — بدون لمس باقي العروض.
*/

// إضافة عرض واحد
const addPartnerOffer = asyncWrapper(async (req, res, next) => {
  const partner = await Partner.findByIdAndUpdate(
    req.params.id,
    { $push: { discountOffers: req.body } },
    { returnDocument: "after", runValidators: true },
  );
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  const added = partner.discountOffers[partner.discountOffers.length - 1];
  logAudit(req, {
    action: "partner.offer.add", targetType: "partner", targetId: partner._id, targetLabel: partner.name,
    meta: { offerTitle: added.title },
  });
  res.status(201).json({ status: SUCCESS, data: added });
});

// تعديل عرض واحد — بدون إعادة كتابة باقي العروض
const updatePartnerOffer = asyncWrapper(async (req, res, next) => {
  // تهيئة $set لكل حقل مرسل على العنصر المستهدف داخل الـ array
  const setFields = {};
  for (const [key, value] of Object.entries(req.body)) {
    setFields[`discountOffers.$[offer].${key}`] = value;
  }
  const partner = await Partner.findOneAndUpdate(
    { _id: req.params.id, "discountOffers._id": req.params.offerId },
    { $set: setFields },
    { arrayFilters: [{ "offer._id": req.params.offerId }], returnDocument: "after", runValidators: true },
  );
  if (!partner) return next(appError.create("الشريك أو العرض غير موجود", 404, ERROR));
  const updated = partner.discountOffers.id(req.params.offerId);
  logAudit(req, {
    action: "partner.offer.update", targetType: "partner", targetId: partner._id, targetLabel: partner.name,
    meta: { offerTitle: updated?.title, isActive: updated?.isActive },
  });
  res.status(200).json({ status: SUCCESS, data: updated });
});

// حذف عرض واحد
const deletePartnerOffer = asyncWrapper(async (req, res, next) => {
  const partner = await Partner.findByIdAndUpdate(
    req.params.id,
    { $pull: { discountOffers: { _id: req.params.offerId } } },
    { returnDocument: "after" },
  );
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  logAudit(req, {
    action: "partner.offer.delete", targetType: "partner", targetId: partner._id, targetLabel: partner.name,
    meta: { offerId: req.params.offerId },
  });
  res.status(200).json({ status: SUCCESS, msg: "تم حذف العرض بنجاح" });
});

module.exports = {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  addPartnerOffer,
  updatePartnerOffer,
  deletePartnerOffer,
};
