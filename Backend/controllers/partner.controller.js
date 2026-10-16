const Partner = require("../models/Partner");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");

const getAllPartners = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

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
  const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  logAudit(req, {
    action: "partner.update", targetType: "partner", targetId: partner._id, targetLabel: partner.name,
    meta: { isActive: partner.isActive },
  });
  res.status(200).json({ status: SUCCESS, data: partner });
});

const deletePartner = asyncWrapper(async (req, res, next) => {
  const partner = await Partner.findByIdAndDelete(req.params.id);
  if (!partner) return next(appError.create("الشريك غير موجود", 404, ERROR));
  logAudit(req, { action: "partner.delete", targetType: "partner", targetId: partner._id, targetLabel: partner.name });
  res.status(200).json({ status: SUCCESS, msg: "تم حذف الشريك بنجاح" });
});

module.exports = { getAllPartners, getPartnerById, createPartner, updatePartner, deletePartner };
