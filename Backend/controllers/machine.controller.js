const Machine = require("../models/Machine");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");
const { searchQuery } = require("../utils/searchHelpers");

const getAllMachines = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // فلترة + بحث من السيرفر (يعملوا عبر كل الصفحات مش المعروضة فقط)
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.governorate) filter.governorate = req.query.governorate;
  if (req.query.search) {
    Object.assign(filter, searchQuery(["name", "location", "governorate"], req.query.search));
  }

  const [machines, total] = await Promise.all([
    Machine.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Machine.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: machines,
  });
});

const getMachineById = asyncWrapper(async (req, res, next) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return next(appError.create("الماكينة غير موجودة", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: machine });
});

const createMachine = asyncWrapper(async (req, res) => {
  const machine = await Machine.create(req.body);
  logAudit(req, { action: "machine.create", targetType: "machine", targetId: machine._id, targetLabel: machine.name });
  res.status(201).json({ status: SUCCESS, data: machine });
});

const updateMachine = asyncWrapper(async (req, res, next) => {
  const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true, // يفرض enums/حدود الـ schema حتى لو Joi اتخطيت
  });
  if (!machine) return next(appError.create("الماكينة غير موجودة", 404, ERROR));
  logAudit(req, {
    action: "machine.update", targetType: "machine", targetId: machine._id, targetLabel: machine.name,
    meta: { status: machine.status, fillPercentage: machine.fillPercentage },
  });
  res.status(200).json({ status: SUCCESS, data: machine });
});

const deleteMachine = asyncWrapper(async (req, res, next) => {
  const machine = await Machine.findByIdAndDelete(req.params.id);
  if (!machine) return next(appError.create("الماكينة غير موجودة", 404, ERROR));
  logAudit(req, { action: "machine.delete", targetType: "machine", targetId: machine._id, targetLabel: machine.name });
  res.status(200).json({ status: SUCCESS, msg: "تم حذف الماكينة بنجاح" });
});

module.exports = { getAllMachines, getMachineById, createMachine, updateMachine, deleteMachine };
