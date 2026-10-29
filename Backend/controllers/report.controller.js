/**
 * تصدير التقارير — Excel حقيقي (exceljs) بترميز عربي سليم
 * الأنواع: transactions | monthly | materials | coupons
 */
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { ERROR } = require("../utils/httpStatusText");
const ExcelJS = require("exceljs");
const Transaction = require("../models/Transaction");
const Coupon = require("../models/Coupon");
const { logAudit } = require("../utils/audit");

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const AR_MATERIALS = {
  plastic: "بلاستيك", glass: "زجاج", cardboard: "كرتون", paper: "ورق",
};
const AR_STATUS = {
  active: "تعمل", nearlyFull: "شبه ممتلئة", offline: "متوقفة",
  issued: "مُصدر", redeemed: "مُستبدل", cancelled: "ملغي",
};
const AR_TYPE = { deposit: "إيداع", withdrawal: "سحب" };

const BRAND_GREEN = "FF0D6C3D";

function headerRow(ws, headers) {
  const row = ws.addRow(headers);
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_GREEN } };
  row.alignment = { horizontal: "center", vertical: "middle" };
  row.height = 24;
  return row;
}

const exportTransactions = async (res) => {
  const transactions = await Transaction.find()
    .populate("user", "username email")
    .populate("machine", "name governorate")
    .sort({ createdAt: -1 })
    .limit(5000);

  const wb = new ExcelJS.Workbook();
  wb.creator = "EcoCycle";
  const ws = wb.addWorksheet("المعاملات", { views: [{ rightToLeft: true }] });

  headerRow(ws, ["التاريخ", "المستخدم", "النوع", "الخامة", "الوزن (كجم)", "القيمة (ج.م)", "الماكينة", "المحافظة", "مشبوهة"]);

  transactions.forEach((t) => {
    const row = ws.addRow([
      t.createdAt.toLocaleDateString("ar-EG") + " " + t.createdAt.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      t.user?.username || "—",
      AR_TYPE[t.type] || t.type,
      t.materialType ? AR_MATERIALS[t.materialType] || t.materialType : "—",
      t.weightKg || 0,
      t.amount ?? 0,
      t.machine?.name || "—",
      t.machine?.governorate || "—",
      t.suspicious ? "نعم" : "لا",
    ]);
    if (t.suspicious) {
      row.getCell(9).font = { bold: true, color: { argb: "FFB3261E" } };
    }
  });

  // ملخص أعلى الصفحة
  const totalAmount = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const totalWeight = transactions.reduce((s, t) => s + (t.weightKg || 0), 0);
  ws.spliceRows(1, 0, [], []);
  const title = ws.getRow(1);
  title.getCell(1).value = `تقرير معاملات EcoCycle — ${transactions.length} معاملة | إجمالي القيمة ${totalAmount.toFixed(2)} ج.م | إجمالي الوزن ${totalWeight.toFixed(1)} كجم`;
  title.getCell(1).font = { bold: true, size: 14, color: { argb: BRAND_GREEN } };
  return wb;
};

const exportMonthly = async (res) => {
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
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 12 },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "EcoCycle";
  const ws = wb.addWorksheet("الإيرادات الشهرية", { views: [{ rightToLeft: true }] });
  headerRow(ws, ["الشهر", "السنة", "عدد المعاملات", "الوزن (كجم)", "الإيرادات (ج.م)"]);
  months.forEach((m) =>
    ws.addRow([AR_MONTHS[m._id.month - 1], m._id.year, m.count, m.totalWeight.toFixed(1), m.totalAmount.toFixed(2)]),
  );

  return wb;
};

const exportMaterials = async () => {
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
    { $sort: { totalWeight: -1 } },
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "EcoCycle";
  const ws = wb.addWorksheet("الخامات", { views: [{ rightToLeft: true }] });
  headerRow(ws, ["الخامة", "عدد الإيداعات", "الوزن (كجم)", "القيمة (ج.م)"]);
  materials.forEach((m) =>
    ws.addRow([AR_MATERIALS[m._id] || m._id || "غير محدد", m.count, m.totalWeight.toFixed(1), m.totalAmount.toFixed(2)]),
  );
  return wb;
};

const exportCoupons = async () => {
  const coupons = await Coupon.find()
    .populate("user", "username phoneNumber")
    .populate("partner", "name")
    .sort({ createdAt: -1 })
    .limit(5000);

  const wb = new ExcelJS.Workbook();
  wb.creator = "EcoCycle";
  const ws = wb.addWorksheet("الكوبونات", { views: [{ rightToLeft: true }] });
  headerRow(ws, ["الكود", "المستخدم", "الشريك", "العرض", "التكلفة (نقاط)", "الحالة", "تاريخ الإصدار", "تاريخ الاستبدال"]);
  coupons.forEach((c) =>
    ws.addRow([
      c.code,
      c.user?.username || "—",
      c.partner?.name || "—",
      c.offer?.title || "—",
      c.pointsCost,
      AR_STATUS[c.status] || c.status,
      c.createdAt.toLocaleDateString("ar-EG"),
      c.redeemedAt ? c.redeemedAt.toLocaleDateString("ar-EG") : "—",
    ]),
  );
  return wb;
};

const exportReport = asyncWrapper(async (req, res, next) => {
  const type = req.query.type || "transactions";

  const wb =
    type === "monthly"
      ? await exportMonthly()
      : type === "materials"
        ? await exportMaterials()
        : type === "coupons"
          ? await exportCoupons()
          : await exportTransactions();

  logAudit(req, {
    action: "report.export",
    targetType: "system",
    targetLabel: `excel/${type}`,
  });

  const filename = `EcoCycle-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);

  await wb.xlsx.write(res);
  res.end();
});

module.exports = { exportReport };
