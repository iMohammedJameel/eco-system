const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Machine = require("../models/Machine");
const QRSession = require("../models/QRSession");
const Pricing = require("../models/Pricing");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const crypto = require("crypto");
const { evaluateAchievements } = require("../utils/achievementEngine");
const { checkDepositFraud } = require("../utils/fraudDetection");
const { logAudit } = require("../utils/audit");

// Fallback prices used only if a material has no Pricing record in DB.
// Real prices are always read from the Pricing collection (admin-managed).
const DEFAULT_PRICES = {
  plastic: 5,
  glass: 3,
  cardboard: 4,
  paper: 2,
};

const QR_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

function calcLevel(totalKg) {
  if (totalKg >= 100) return "excellent";
  if (totalKg >= 50) return "good";
  if (totalKg >= 20) return "active";
  return "beginner";
}

/**
 * المنطق المشترك بعد إنشاء معاملة الإيداع:
 * تحديث المستخدم/الماكينة بشكل ذرّي + إنجازات + كشف احتيال
 */
async function applyDepositEffects({ userId, machineId, weightKg, amount, transactionId }) {
  // تحديث ذرّي للرصيد والإحصائيات (يمنع race conditions)
  const user = await User.findOneAndUpdate(
    { _id: userId },
    {
      $inc: { balance: amount, totalDeposits: weightKg },
    },
    { new: true },
  );
  const newLevel = calcLevel(user.totalDeposits);
  if (newLevel !== user.level) {
    await User.updateOne({ _id: userId }, { $set: { level: newLevel } });
  }

  // تحديث الماكينة ذرّيًا
  const machine = await Machine.findById(machineId);
  if (machine) {
    const newFill = Math.min((machine.fillPercentage || 0) + weightKg * 0.5, 100);
    await Machine.updateOne(
      { _id: machineId },
      {
        $set: {
          totalCollected: (machine.totalCollected || 0) + weightKg,
          fillPercentage: newFill,
          status: newFill >= 90 ? "nearlyFull" : machine.status,
          lastPingAt: new Date(),
        },
      },
    );
  }

  // محرك الإنجازات — في الخلفية (لا يوقف الإيداع)
  const unlocked = await evaluateAchievements(userId).catch(() => []);

  // كشف الاحتيال — لا يوقف الإيداع
  const fraud = await checkDepositFraud(userId, transactionId, machineId);

  // الرصيد النهائي بعد مكافآت الإنجازات (لو فتحت)
  const finalUser = unlocked.length > 0 ? await User.findById(userId).select("balance") : user;

  return { newBalance: finalUser.balance, unlocked, fraud };
}

// Generate QR session (stored in DB with TTL)
const generateQRSession = asyncWrapper(async (req, res, next) => {
  const { machineId } = req.body;

  const machine = await Machine.findById(machineId);
  if (!machine) return next(appError.create("الماكينة غير موجودة", 404, ERROR));
  if (machine.status === "offline")
    return next(appError.create("الماكينة خارج الخدمة حاليًا", 400, ERROR));

  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + QR_SESSION_TTL_MS);

  await QRSession.create({
    token,
    user: req.user.id,
    machine: machineId,
    expiresAt,
  });

  res.status(201).json({
    status: SUCCESS,
    data: { qrToken: token, expiresIn: QR_SESSION_TTL_MS / 1000 },
  });
});

// Get all transactions (admin) with pagination + optional filters
const getAllTransactions = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.materialType) filter.materialType = req.query.materialType;
  if (req.query.userId) filter.user = req.query.userId;
  if (req.query.machineId) filter.machine = req.query.machineId;
  if (req.query.suspicious === "true") filter.suspicious = true;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("user", "username email phoneNumber")
      .populate("machine", "name location governorate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: transactions,
  });
});

// Get transactions for logged-in user with pagination + optional type filter
const getMyTransactions = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };
  if (req.query.type) filter.type = req.query.type;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("machine", "name location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: transactions,
  });
});

/**
 * معلومات جلسة QR — عامة (بدون توثيق) لصفحة الإيداع PWA
 * لا تُرجع أي بيانات حساسة
 */
const getQRSessionInfo = asyncWrapper(async (req, res, next) => {
  const { qrToken } = req.query;
  if (!qrToken) return next(appError.create("رمز QR مطلوب", 400, ERROR));

  const session = await QRSession.findOne({ token: qrToken }).populate(
    "machine",
    "name location governorate status",
  );
  if (!session) return next(appError.create("جلسة QR غير صالحة", 404, ERROR));

  const expired = session.expiresAt < new Date();

  res.status(200).json({
    status: SUCCESS,
    data: {
      valid: !session.used && !expired,
      used: session.used,
      expiresAt: session.expiresAt,
      machine: session.machine
        ? {
            id: session.machine._id,
            name: session.machine.name,
            location: session.machine.location,
            governorate: session.machine.governorate,
            status: session.machine.status,
          }
        : null,
    },
  });
});

/** تسعير الخامات النشطة — عامة لصفحة PWA */
const getActiveMaterials = asyncWrapper(async (req, res) => {
  const pricings = await Pricing.find({ isActive: true }).select("materialType pricePerKg");
  const data = pricings.length
    ? pricings.map((p) => ({ materialType: p.materialType, pricePerKg: p.pricePerKg }))
    : Object.entries(DEFAULT_PRICES).map(([materialType, pricePerKg]) => ({ materialType, pricePerKg }));
  res.status(200).json({ status: SUCCESS, data });
});

/**
 * إيداع عام عبر PWA — المستخدم يمسح QR من الموبايل،
 * يدخل رقم تليفونه (أو يُنشأ حساب تلقائيًا) ويؤكد الإيداع.
 */
const claimPublicDeposit = asyncWrapper(async (req, res, next) => {
  const { qrToken, phoneNumber, materialType, weightKg, username } = req.body;

  if (!qrToken || !phoneNumber || !materialType || !weightKg)
    return next(appError.create("كل البيانات مطلوبة: رمز QR ورقم الهاتف ونوع المادة والوزن", 400, ERROR));

  const phone = String(phoneNumber).replace(/\s|-/g, "");
  if (!/^(\+?2)?01[0-25]\d{8}$/.test(phone))
    return next(appError.create("رقم الهاتف يجب أن يكون رقمًا مصريًا صحيحًا", 400, ERROR));

  // حجز الجلسة بشكل ذرّي (يمنع الاستخدام المزدوج)
  const session = await QRSession.findOneAndUpdate(
    { token: qrToken, used: false },
    { used: true },
    { new: true },
  );
  if (!session)
    return next(appError.create("جلسة QR غير صالحة أو منتهية أو مستخدمة من قبل", 400, ERROR));
  if (session.expiresAt < new Date()) {
    await QRSession.deleteOne({ _id: session._id });
    return next(appError.create("انتهت صلاحية جلسة QR — امسح رمزًا جديدًا", 400, ERROR));
  }

  const machine = await Machine.findById(session.machine);
  if (!machine || machine.status === "offline") {
    await QRSession.deleteOne({ _id: session._id });
    return next(appError.create("الماكينة غير متاحة حاليًا", 400, ERROR));
  }

  // جلب/إنشاء المستخدم برقم التليفون
  let user = await User.findOne({ phoneNumber: phone }).sort({ createdAt: -1 });
  let createdAccount = false;
  if (!user) {
    const randomPass = crypto.randomBytes(8).toString("hex");
    user = await User.create({
      username: username || `مستخدم ${phone.slice(-4)}`,
      email: `${phone}@wallet.ecocycle.app`,
      phoneNumber: phone,
      password: randomPass,
    });
    createdAccount = true;
  }
  if (!user.isActive)
    return next(appError.create("الحساب معطّل — تواصل مع الدعم", 403, ERROR));

  const pricing = await Pricing.findOne({ materialType, isActive: true });
  const pricePerKg = pricing ? pricing.pricePerKg : DEFAULT_PRICES[materialType];
  if (pricePerKg === undefined)
    return next(appError.create("نوع المادة غير صالح", 400, ERROR));

  const weight = parseFloat(weightKg);
  const amount = parseFloat((weight * pricePerKg).toFixed(2));

  const transaction = await Transaction.create({
    user: user._id,
    machine: machine._id,
    type: "deposit",
    materialType,
    weightKg: weight,
    itemsCount: 0,
    amount,
  });

  await QRSession.deleteOne({ _id: session._id });

  const { newBalance, unlocked, fraud } = await applyDepositEffects({
    userId: user._id,
    machineId: machine._id,
    weightKg: weight,
    amount,
    transactionId: transaction._id,
  });

  res.status(201).json({
    status: SUCCESS,
    data: {
      transaction,
      earned: amount,
      newBalance,
      unlockedAchievements: unlocked,
      suspicious: fraud.suspicious,
      user: {
        username: user.username,
        phoneNumber: user.phoneNumber,
        level: user.level,
        createdAccount,
      },
      machine: { name: machine.name, location: machine.location },
    },
  });
});

// Deposit via QR session — price read from Pricing collection (admin-managed)
const deposit = asyncWrapper(async (req, res, next) => {
  const { qrToken, materialType, weightKg, itemsCount } = req.body;

  // Fetch session, mark as used atomically (prevents double-deposit race)
  const session = await QRSession.findOneAndUpdate(
    { token: qrToken, used: false },
    { used: true },
    { new: true },
  );
  if (!session)
    return next(appError.create("جلسة QR غير صالحة أو منتهية أو مستخدمة من قبل", 400, ERROR));

  if (session.expiresAt < new Date()) {
    await QRSession.deleteOne({ _id: session._id });
    return next(appError.create("انتهت صلاحية جلسة QR — امسح رمزًا جديدًا", 400, ERROR));
  }
  if (session.user.toString() !== req.user.id)
    return next(appError.create("جلسة QR لا تخص هذا الحساب", 403, ERROR));

  const [machine, user, pricing] = await Promise.all([
    Machine.findById(session.machine),
    User.findById(req.user.id),
    Pricing.findOne({ materialType, isActive: true }),
  ]);

  if (!machine) return next(appError.create("الماكينة غير موجودة", 404, ERROR));
  if (machine.status === "offline")
    return next(appError.create("الماكينة خارج الخدمة حاليًا", 400, ERROR));
  if (!user.isActive) return next(appError.create("الحساب معطّل", 403, ERROR));

  const pricePerKg = pricing ? pricing.pricePerKg : DEFAULT_PRICES[materialType];
  if (pricePerKg === undefined)
    return next(appError.create("نوع المادة غير صالح", 400, ERROR));

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

  await QRSession.deleteOne({ _id: session._id });

  const { newBalance, unlocked, fraud } = await applyDepositEffects({
    userId: user._id,
    machineId: machine._id,
    weightKg,
    amount,
    transactionId: transaction._id,
  });

  res.status(201).json({
    status: SUCCESS,
    data: { transaction, newBalance, earned: amount, unlockedAchievements: unlocked, suspicious: fraud.suspicious },
  });
});

// Withdrawal — no machineId needed (خصم ذرّي بشرط كفاية الرصيد)
const withdraw = asyncWrapper(async (req, res, next) => {
  const { amount, withdrawalMethod, accountNumber } = req.body;

  // ذرّي: لو الرصيد غير كافٍ العملية كلها تفشل بدون أي تعديل
  const user = await User.findOneAndUpdate(
    { _id: req.user.id, balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { new: true },
  );
  if (!user) {
    // ممكن المستخدم نفسه مش موجود
    const exists = await User.exists({ _id: req.user.id });
    if (!exists) return next(appError.create("المستخدم غير موجود", 404, ERROR));
    return next(appError.create("الرصيد غير كافٍ لإتمام عملية السحب", 400, ERROR));
  }

  const transaction = await Transaction.create({
    user: user._id,
    type: "withdrawal",
    amount,
    withdrawalMethod,
    accountNumber,
  });

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
  if (!transaction)
    return next(appError.create("العملية غير موجودة", 404, ERROR));

  // Users can only see their own transactions; admins can see any
  if (
    req.user.role === "user" &&
    transaction.user._id.toString() !== req.user.id
  ) {
    return next(appError.create("ليست لديك صلاحية للوصول لهذه العملية", 403, ERROR));
  }

  res.status(200).json({ status: SUCCESS, data: transaction });
});

module.exports = {
  generateQRSession,
  getAllTransactions,
  getMyTransactions,
  getQRSessionInfo,
  getActiveMaterials,
  claimPublicDeposit,
  deposit,
  withdraw,
  getTransactionById,
};
