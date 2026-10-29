/**
 * محرك الإنجازات — يُستدعى بعد كل عملية إيداع
 * يقارن إحصائيات المستخدم بمعايير الإنجازات النشطة،
 * يفتح الإنجازات الجديدة + يضيف المكافأة + ينشئ إشعار
 */
const mongoose = require("mongoose");
const User = require("../models/User");
const Achievement = require("../models/Achievement");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

async function evaluateAchievements(userId) {
  const newlyUnlocked = [];

  const [user, achievements] = await Promise.all([
    User.findById(userId),
    Achievement.find({ isActive: true }),
  ]);
  if (!user || achievements.length === 0) return newlyUnlocked;

  // إحصائيات القياس
  const depositsCount = await Transaction.countDocuments({ user: userId, type: "deposit" });
  const metrics = {
    totalDeposits: user.totalDeposits || 0, // كجم المعاد تدويرها
    depositsCount,
    balance: user.balance || 0,
    co2Saved: (user.totalDeposits || 0) * 0.5, // معادلة مبسطة: 0.5 كجم CO2 لكل كجم
  };

  const unlockedMap = new Map(
    (user.achievements || []).map((a) => [String(a.achievement), a.unlockedAt]),
  );

  const ops = [];
  for (const ach of achievements) {
    if (unlockedMap.has(String(ach._id))) continue;
    const value = metrics[ach.metric];
    if (value === undefined || value < ach.threshold) continue;

    newlyUnlocked.push({
      id: ach._id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      badgeColor: ach.badgeColor,
      xpReward: ach.xpReward,
    });

    ops.push(
      User.updateOne(
        { _id: userId, "achievements.achievement": { $ne: ach._id } },
        {
          $push: { achievements: { achievement: ach._id, unlockedAt: new Date() } },
          $inc: { balance: ach.xpReward || 0 },
        },
      ),
      Notification.create({
        title: `🎉 إنجاز جديد: ${ach.name}`,
        message: ach.description || `فتحت إنجاز ${ach.name}! ${ach.xpReward ? `كسبت ${ach.xpReward} ج.م مكافأة.` : ""}`,
        type: "earnings",
        recipient: userId,
      }),
    );
  }

  await Promise.all(ops);
  return newlyUnlocked;
}

module.exports = { evaluateAchievements };
