const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Machine = require("../models/Machine");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const crypto = require("crypto");

const MATERIAL_PRICES = {
  plastic: 5,
  glass: 3,
  cardboard: 4,
  paper: 2,
};

// In-memory QR sessions { token: { userId, machineId, expiresAt } }
const qrSessions = new Map();

// Generate QR session
const generateQRSession = asyncWrapper(async (req, res, next) => {
  const { machineId } = req.body;

  const machine = await Machine.findById(machineId);
  if (!machine) return next(appError.create("Machine not found", 404, ERROR));
  if (machine.status === "offline") return next(appError.create("Machine is offline", 400, ERROR));

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  qrSessions.set(token, { userId: req.user.id, machineId, expiresAt });

  res.status(201).json({ status: SUCCESS, data: { qrToken: token, expiresIn: 300 } });
});

// Get all transactions (admin) with pagination
const getAllTransactions = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find()
      .populate("user", "username email")
      .populate("machine", "name location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: transactions,
  });
});

// Get transactions for logged-in user with pagination
const getMyTransactions = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find({ user: req.user.id })
      .populate("machine", "name location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments({ user: req.user.id }),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: transactions,
  });
});

// Deposit via QR session
const deposit = asyncWrapper(async (req, res, next) => {
  const { qrToken, materialType, weightKg, itemsCount } = req.body;

  const session = qrSessions.get(qrToken);
  if (!session) return next(appError.create("Invalid or expired QR session", 400, ERROR));
  if (Date.now() > session.expiresAt) {
    qrSessions.delete(qrToken);
    return next(appError.create("QR session expired", 400, ERROR));
  }
  if (session.userId !== req.user.id) return next(appError.create("QR session does not belong to you", 403, ERROR));

  const [machine, user] = await Promise.all([
    Machine.findById(session.machineId),
    User.findById(req.user.id),
  ]);

  if (!machine) return next(appError.create("Machine not found", 404, ERROR));
  if (machine.status === "offline") return next(appError.create("Machine is offline", 400, ERROR));
  if (!user.isActive) return next(appError.create("Account is disabled", 403, ERROR));

  const pricePerKg = MATERIAL_PRICES[materialType];
  if (!pricePerKg) return next(appError.create("Invalid material type", 400, ERROR));

  const amount = parseFloat((weightKg * pricePerKg).toFixed(2));

  const transaction = await Transaction.create({
    user: user._id,
    machine: machine._id,
    type: "deposit",
    materialType,
    weightKg,
    itemsCount: itemsCount || 0,
    amount,
  });

  user.balance += amount;
  user.totalDeposits += weightKg;
  user.level = calcLevel(user.totalDeposits);
  await user.save();

  machine.totalCollected += weightKg;
  machine.fillPercentage = Math.min(machine.fillPercentage + weightKg * 0.5, 100);
  if (machine.fillPercentage >= 90) machine.status = "nearlyFull";
  machine.lastPingAt = new Date();
  await machine.save();

  qrSessions.delete(qrToken);

  res.status(201).json({
    status: SUCCESS,
    data: { transaction, newBalance: user.balance, earned: amount },
  });
});

// Withdrawal - no machineId needed
const withdraw = asyncWrapper(async (req, res, next) => {
  const { amount, withdrawalMethod, accountNumber } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return next(appError.create("User not found", 404, ERROR));
  if (user.balance < amount) return next(appError.create("Insufficient balance", 400, ERROR));

  const transaction = await Transaction.create({
    user: user._id,
    type: "withdrawal",
    amount,
    withdrawalMethod,
    accountNumber,
  });

  user.balance -= amount;
  await user.save();

  res.status(201).json({
    status: SUCCESS,
    data: { transaction, newBalance: user.balance },
  });
});

// Get transaction by id
const getTransactionById = asyncWrapper(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate("user", "username email")
    .populate("machine", "name location");
  if (!transaction) return next(appError.create("Transaction not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: transaction });
});

function calcLevel(totalKg) {
  if (totalKg >= 100) return "excellent";
  if (totalKg >= 50) return "good";
  if (totalKg >= 20) return "active";
  return "beginner";
}

module.exports = { generateQRSession, getAllTransactions, getMyTransactions, deposit, withdraw, getTransactionById };
