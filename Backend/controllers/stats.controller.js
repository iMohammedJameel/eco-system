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
    // إصلاح: الأحدث 12 شهرًا (كانت تأخذ الأقدم)، ثم ترتيب تصاعدي للعرض
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
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

/**
 * بيانات حقيقية لرسم "اليوم" — تجميع بالساعة من 8 صباحًا حتى 8 مساءً
 * (قبل الإصلاح: الواجهة كانت تولّد منحنى مزيفًا بمعادلات Math.sin)
 */
const getTodayHourlyStats = asyncWrapper(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const hourly = await Transaction.aggregate([
    { $match: { type: "deposit", createdAt: { $gte: startOfDay } } },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        totalWeight: { $sum: "$weightKg" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // بناء كل الساعات من 0 إلى 23 (حتى الفترات الفاضية تظهر صفرًا)
  const byHour = new Map(hourly.map((h) => [h._id, h]));
  const data = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    totalWeight: Math.round((byHour.get(hour)?.totalWeight || 0) * 100) / 100,
    totalAmount: Math.round((byHour.get(hour)?.totalAmount || 0) * 100) / 100,
    count: byHour.get(hour)?.count || 0,
  }));

  res.status(200).json({ status: SUCCESS, data });
});

/**
 * بيانات حقيقية لرسم "الأسبوع" — آخر 7 أيام مجمّعة باليوم
 */
const getWeekDailyStats = asyncWrapper(async (req, res) => {
  const days = await Transaction.aggregate([
    { $match: { type: "deposit", createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalWeight: { $sum: "$weightKg" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  res.status(200).json({ status: SUCCESS, data: days });
});

// Leaderboard — top users by totalDeposits (weight recycled), with filters
const getLeaderboard = asyncWrapper(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  // فلتر المحافظة — إصلاح: كان متجاهلاً (join الماكينات قبل التجميع)
  const match = { type: "deposit" };
  const pipeline = [{ $match: match }];

  if (req.query.governorate) {
    pipeline.push(
      {
        $lookup: {
          from: "machines",
          localField: "machine",
          foreignField: "_id",
          as: "machineInfo",
        },
      },
      { $unwind: "$machineInfo" },
      { $match: { "machineInfo.governorate": req.query.governorate } },
    );
  }

  pipeline.push(
    {
      $group: {
        _id: "$user",
        totalWeight: { $sum: "$weightKg" },
        totalAmount: { $sum: "$amount" },
        depositsCount: { $sum: 1 },
      },
    },
    { $sort: { totalWeight: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        totalWeight: 1,
        totalAmount: 1,
        depositsCount: 1,
        username: "$user.username",
        email: "$user.email",
        phoneNumber: "$user.phoneNumber",
        level: "$user.level",
        balance: "$user.balance",
        isActive: "$user.isActive",
      },
    },
  );

  const leaderboard = await Transaction.aggregate(pipeline);

  // Attach rank
  const ranked = leaderboard.map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));

  res.status(200).json({ status: SUCCESS, data: ranked });
});

// تنبؤات امتلاء الماكينات (تحليل تنبؤي للفريق التشغيلي)
const getMachineForecasts = asyncWrapper(async (req, res) => {
  const { getFillForecasts } = require("../utils/fillForecast");
  const forecasts = await getFillForecasts();
  res.status(200).json({
    status: SUCCESS,
    data: forecasts,
    summary: {
      urgent: forecasts.filter((f) => f.urgent).length,
      nearlyFull: forecasts.filter((f) => f.status === "nearlyFull").length,
    },
  });
});

module.exports = { getDashboardStats, getMonthlyStats, getMaterialStats, getTodayHourlyStats, getWeekDailyStats, getLeaderboard, getMachineForecasts };
