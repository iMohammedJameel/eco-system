const User = require("../models/User");
const Machine = require("../models/Machine");
const Transaction = require("../models/Transaction");
const asyncWrapper = require("../middleware/asyncWrapper");
const { SUCCESS } = require("../utils/httpStatusText");

const getDashboardStats = asyncWrapper(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalMachines,
    activeMachines,
    totalTransactions,
    depositAgg,
    withdrawAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Machine.countDocuments(),
    Machine.countDocuments({ status: "active" }),
    Transaction.countDocuments(),
    Transaction.aggregate([
      { $match: { type: "deposit" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, totalWeight: { $sum: "$weightKg" } } },
    ]),
    Transaction.aggregate([
      { $match: { type: "withdrawal" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]),
  ]);

  res.status(200).json({
    status: SUCCESS,
    data: {
      users: { total: totalUsers, active: activeUsers },
      machines: { total: totalMachines, active: activeMachines },
      transactions: { total: totalTransactions },
      recycling: {
        totalWeightKg: depositAgg[0]?.totalWeight || 0,
        totalRevenue: depositAgg[0]?.totalAmount || 0,
        totalWithdrawals: withdrawAgg[0]?.totalAmount || 0,
      },
    },
  });
});

const getMonthlyStats = asyncWrapper(async (req, res) => {
  const months = await Transaction.aggregate([
    { $match: { type: "deposit" } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        totalAmount: { $sum: "$amount" },
        totalWeight: { $sum: "$weightKg" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({ status: SUCCESS, data: months });
});

const getMaterialStats = asyncWrapper(async (req, res) => {
  const materials = await Transaction.aggregate([
    { $match: { type: "deposit" } },
    {
      $group: {
        _id: "$materialType",
        totalWeight: { $sum: "$weightKg" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({ status: SUCCESS, data: materials });
});

module.exports = { getDashboardStats, getMonthlyStats, getMaterialStats };
