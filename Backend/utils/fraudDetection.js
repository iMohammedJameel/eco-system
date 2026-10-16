/**
 * كشف الاحتيال — يُستدعى بعد كل إيداع
 * قاعدتان:
 *  1) 5 إيداعات أو أكثر خلال 15 دقيقة → سلوك غير طبيعي
 *  2) إيداعات من محافظتين مختلفتين خلال 10 دقائق → "انتقال مستحيل"
 * عند الاشتباه: علم المعاملة suspicious + بلاغ عطال تلقائي بأولوية عالية
 */
const Transaction = require("../models/Transaction");
const Issue = require("../models/Issue");

const RAPID_WINDOW_MS = 15 * 60 * 1000; // 15 دقيقة
const RAPID_THRESHOLD = 5; // 5 إيداعات
const TRAVEL_WINDOW_MS = 10 * 60 * 1000; // 10 دقائق

async function checkDepositFraud(userId, currentTransactionId, currentMachineId) {
  try {
    const since = new Date(Date.now() - RAPID_WINDOW_MS);
    const recent = await Transaction.find({
      user: userId,
      type: "deposit",
      createdAt: { $gte: since },
    })
      .populate("machine", "governorate name")
      .sort({ createdAt: 1 });

    let reason = null;

    // القاعدة 1: إيداعات متتالية أسرع من الممكن فيزيائيًا
    if (recent.length >= RAPID_THRESHOLD) {
      reason = `عدد ${recent.length} إيداعات خلال ${RAPID_WINDOW_MS / 60000} دقيقة`;
    }

    // القاعدة 2: محافظات مختلفة في نافذة ضيقة
    if (!reason) {
      const travelSince = new Date(Date.now() - TRAVEL_WINDOW_MS);
      const govs = new Map();
      for (const t of recent) {
        if (t.createdAt < travelSince || !t.machine) continue;
        govs.set(String(t.machine.governorate), t.machine);
      }
      if (govs.size >= 2) {
        reason = `إيداعات من ${govs.size} محافظات مختلفة خلال ${TRAVEL_WINDOW_MS / 60000} دقيقة`;
      }
    }

    if (!reason) return { suspicious: false };

    // علّم كل معاملات النافذة + الحالية
    await Transaction.updateMany(
      { _id: { $in: [...recent.map((t) => t._id), currentTransactionId] } },
      { $set: { suspicious: true } },
    );

    // بلاغ تلقائي لأولوية عالية
    await Issue.create({
      user: userId,
      machine: currentMachineId,
      type: "fraud",
      description: `كشف النظام نشاطًا مشبوهًا: ${reason}. المراجعة مطلوبة قبل اعتماد الرصيد.`,
      priority: "high",
      status: "open",
    });

    return { suspicious: true, reason };
  } catch (err) {
    console.error("FRAUD_CHECK_ERROR:", err.message);
    return { suspicious: false };
  }
}

module.exports = { checkDepositFraud };
