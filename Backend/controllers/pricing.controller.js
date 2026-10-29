const Pricing = require("../models/Pricing");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");

// Get all pricing configurations
const getAllPricing = asyncWrapper(async (req, res) => {
  const pricings = await Pricing.find().sort({ materialType: 1 });

  res.status(200).json({
    status: SUCCESS,
    data: pricings,
  });
});

// Get pricing by id
const getPricingById = asyncWrapper(async (req, res, next) => {
  const pricing = await Pricing.findById(req.params.id);
  if (!pricing) return next(appError.create("سعر المادة غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: pricing });
});

// Create new pricing (only if materialType doesn't already exist)
const createPricing = asyncWrapper(async (req, res, next) => {
  const { materialType } = req.body;

  const existPricing = await Pricing.findOne({ materialType });
  if (existPricing)
    return next(appError.create("يوجد سعر مسجّل لهذه المادة بالفعل", 400, ERROR));

  const pricing = await Pricing.create({ ...req.body, updatedBy: req.user.id });
  logAudit(req, {
    action: "pricing.create", targetType: "pricing", targetId: pricing._id,
    targetLabel: pricing.materialType, meta: { pricePerKg: pricing.pricePerKg },
  });
  res.status(201).json({ status: SUCCESS, data: pricing });
});

// Update pricing (only price/currency/isActive — materialType is locked)
const updatePricing = asyncWrapper(async (req, res, next) => {
  const updates = { ...req.body };
  updates.updatedBy = req.user.id;

  const pricing = await Pricing.findByIdAndUpdate(req.params.id, updates, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!pricing) return next(appError.create("سعر المادة غير موجود", 404, ERROR));
  logAudit(req, {
    action: "pricing.update", targetType: "pricing", targetId: pricing._id,
    targetLabel: pricing.materialType, meta: { pricePerKg: pricing.pricePerKg, isActive: pricing.isActive },
  });
  res.status(200).json({ status: SUCCESS, data: pricing });
});

// Delete pricing
const deletePricing = asyncWrapper(async (req, res, next) => {
  const pricing = await Pricing.findByIdAndDelete(req.params.id);
  if (!pricing) return next(appError.create("سعر المادة غير موجود", 404, ERROR));
  logAudit(req, { action: "pricing.delete", targetType: "pricing", targetId: pricing._id, targetLabel: pricing.materialType });
  res.status(200).json({ status: SUCCESS, msg: "تم حذف التسعيرة بنجاح" });
});

module.exports = { getAllPricing, getPricingById, createPricing, updatePricing, deletePricing };
