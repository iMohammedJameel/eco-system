const Achievement = require("../models/Achievement");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");
const { logAudit } = require("../utils/audit");

const getAllAchievements = asyncWrapper(async (req, res) => {
  const achievements = await Achievement.find().sort({ threshold: 1 });
  res.status(200).json({ status: SUCCESS, data: achievements });
});

const getAchievementById = asyncWrapper(async (req, res, next) => {
  const achievement = await Achievement.findById(req.params.id);
  if (!achievement) return next(appError.create("الإنجاز غير موجود", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: achievement });
});

const createAchievement = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;
  const exist = await Achievement.findOne({ name });
  if (exist) return next(appError.create("اسم الإنجاز موجود بالفعل", 400, ERROR));

  const achievement = await Achievement.create(req.body);

  // Audit — كان مفقودًا: كل تعديلات الأدمن لازم تكون في سجل التتبع
  logAudit(req, {
    action: "achievement.create",
    targetType: "achievement",
    targetId: achievement._id,
    targetLabel: achievement.name,
    meta: { metric: achievement.metric, threshold: achievement.threshold },
  });

  res.status(201).json({ status: SUCCESS, data: achievement });
});

const updateAchievement = asyncWrapper(async (req, res, next) => {
  const achievement = await Achievement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { returnDocument: "after", runValidators: true },
  );
  if (!achievement) return next(appError.create("الإنجاز غير موجود", 404, ERROR));

  logAudit(req, {
    action: "achievement.update",
    targetType: "achievement",
    targetId: achievement._id,
    targetLabel: achievement.name,
    meta: { metric: achievement.metric, threshold: achievement.threshold, xpReward: achievement.xpReward },
  });

  res.status(200).json({ status: SUCCESS, data: achievement });
});

const deleteAchievement = asyncWrapper(async (req, res, next) => {
  const achievement = await Achievement.findByIdAndDelete(req.params.id);
  if (!achievement) return next(appError.create("الإنجاز غير موجود", 404, ERROR));

  logAudit(req, {
    action: "achievement.delete",
    targetType: "achievement",
    targetId: achievement._id,
    targetLabel: achievement.name,
  });

  res.status(200).json({ status: SUCCESS, msg: "تم حذف الإنجاز بنجاح" });
});

module.exports = {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
