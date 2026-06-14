const Machine = require("../models/Machine");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");

const getAllMachines = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [machines, total] = await Promise.all([
    Machine.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Machine.countDocuments(),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: machines,
  });
});

const getMachineById = asyncWrapper(async (req, res, next) => {
  const machine = await Machine.findById(req.params.id);
  if (!machine) return next(appError.create("Machine not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: machine });
});

const createMachine = asyncWrapper(async (req, res) => {
  const machine = await Machine.create(req.body);
  res.status(201).json({ status: SUCCESS, data: machine });
});

const updateMachine = asyncWrapper(async (req, res, next) => {
  const machine = await Machine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!machine) return next(appError.create("Machine not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: machine });
});

const deleteMachine = asyncWrapper(async (req, res, next) => {
  const machine = await Machine.findByIdAndDelete(req.params.id);
  if (!machine) return next(appError.create("Machine not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, msg: "Machine deleted" });
});

module.exports = { getAllMachines, getMachineById, createMachine, updateMachine, deleteMachine };
