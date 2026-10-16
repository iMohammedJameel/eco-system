/**
 * توقع امتلاء الماكينات — Moving Average على تاريخ الإيداعات
 * fillPercentage تزيد 0.5 لكل كجم (سعة مكافئة 200 كجم)
 * rate = متوسط كجم/يوم آخر 14 يوم → hoursToFull
 */
const Machine = require("../models/Machine");
const Transaction = require("../models/Transaction");

const KG_PER_FILL_PERCENT = 0.5; // من منطق الإيداع: fillPercentage += weightKg * 0.5

async function getFillForecasts() {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [machines, rates] = await Promise.all([
    Machine.find({ status: { $in: ["active", "nearlyFull"] } }).sort({ fillPercentage: -1 }),
    Transaction.aggregate([
      { $match: { type: "deposit", createdAt: { $gte: since } } },
      {
        $group: {
          _id: "$machine",
          totalKg: { $sum: "$weightKg" },
          depositsCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const rateMap = new Map(rates.map((r) => [String(r._id), r]));

  return machines
    .map((m) => {
      const rate = rateMap.get(String(m._id));
      const avgKgPerDay = rate ? rate.totalKg / 14 : 0; // متوسط يومي
      const remainingFill = Math.max(100 - (m.fillPercentage || 0), 0);

      // rate بالكجم/يوم → fill%/يوم = rate * 0.5
      const fillPerDay = avgKgPerDay * KG_PER_FILL_PERCENT;
      let hoursToFull = null;
      if (fillPerDay > 0.01 && remainingFill > 0) {
        hoursToFull = Math.round((remainingFill / fillPerDay) * 24);
      }

      const urgent =
        m.status === "nearlyFull"
          ? hoursToFull !== null && hoursToFull <= 24
          : hoursToFull !== null && hoursToFull <= 48;

      return {
        machineId: m._id,
        name: m.name,
        location: m.location,
        governorate: m.governorate,
        status: m.status,
        fillPercentage: m.fillPercentage,
        avgKgPerDay: Math.round(avgKgPerDay * 10) / 10,
        depositsPerWeek: rate ? Math.round((rate.depositsCount / 14) * 7) : 0,
        hoursToFull,
        expectedFullAt: hoursToFull !== null ? new Date(Date.now() + hoursToFull * 3600000) : null,
        urgent,
      };
    })
    .sort((a, b) => {
      // الأسرع امتلاءً الأول + الممتلئة فعلًا
      if (a.hoursToFull === null) return 1;
      if (b.hoursToFull === null) return -1;
      return a.hoursToFull - b.hoursToFull;
    });
}

module.exports = { getFillForecasts };
