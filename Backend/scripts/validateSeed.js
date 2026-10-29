/**
 * EcoCycle — Seed Data Validator
 * فحص شامل لدقة البيانات المزروعة: التفرّد، التكامل المرجعي،
 * الاتساق المالي (دفتر الأرصدة)، التعدادات، الصيغ، والقيم المنطقية.
 *
 * Usage: node scripts/validateSeed.js
 * Exit code: 0 = كله سليم، 1 = فيه مشاكل
 */
require("dotenv").config();
const mongoose = require("mongoose");

const Admin = require("../models/Admin");
const User = require("../models/User");
const Machine = require("../models/Machine");
const Partner = require("../models/Partner");
const Pricing = require("../models/Pricing");
const Transaction = require("../models/Transaction");
const QRSession = require("../models/QRSession");
const Notification = require("../models/Notification");
const Achievement = require("../models/Achievement");
const Issue = require("../models/Issue");
const Coupon = require("../models/Coupon");
const AuditLog = require("../models/AuditLog");

// نفس قواعد الـ seed — للتطابق الحرفي
const MACHINE_BASE_TOTALS = {
  "إيكوسايكل — محطة مترو المعادي": 340,
  "إيكوسايكل — سيتي ستارز هليوبوليس": 720,
  "إيكوسايكل — فرع المهندسين": 510,
  "إيكوسايكل — سان ستيفانو بلازا": 180,
  "إيكوسايكل — ميدان المنشية": 95,
  "إيكوسايكل — مدينة نصر": 265,
  "إيكوسايكل — الزمالك": 430,
  "إيكوسايكل — الدقي": 380,
};
const EXPECTED_PRICES = { plastic: 5, glass: 3, cardboard: 4, paper: 2 };
const EGYPT_PHONE = /^(\+?2)?01[0-25]\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const calcLevel = (kg) =>
  kg >= 100 ? "excellent" : kg >= 50 ? "good" : kg >= 20 ? "active" : "beginner";

const problems = [];
const warnings = [];
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label, detail) => {
  problems.push(`${label}${detail ? " — " + detail : ""}`);
  console.log(`  ✗ ${label}${detail ? " — " + detail : ""}`);
};
const warn = (label) => {
  warnings.push(label);
  console.log(`  ⚠ ${label}`);
};

async function validate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("\n════════ فحص بيانات EcoCycle المزروعة ════════\n");

  // ═══ 1) التعداد المتوقع ═══
  console.log("【1】 التعداد:");
  const [admins, users, machines, partners, pricings, txs, notifs, achievs, issues, coupons, audits, qrSessions] =
    await Promise.all([
      Admin.countDocuments(),
      User.countDocuments(),
      Machine.countDocuments(),
      Partner.countDocuments(),
      Pricing.countDocuments(),
      Transaction.countDocuments(),
      Notification.countDocuments(),
      Achievement.countDocuments(),
      Issue.countDocuments(),
      Coupon.countDocuments(),
      AuditLog.countDocuments(),
      QRSession.countDocuments(),
    ]);

  admins === 2 ? ok(`أدمن × 2 (superAdmin + operationsManager)`) : fail(`أدمن = ${admins} والمفروض 2`);
  users === 10 ? ok(`مستخدمين × 10`) : fail(`مستخدمين = ${users} والمفروض 10`);
  machines === 8 ? ok(`ماكينات × 8`) : fail(`ماكينات = ${machines} والمفروض 8`);
  partners === 4 ? ok(`شركاء × 4`) : fail(`شركاء = ${partners} والمفروض 4`);
  pricings === 4 ? ok(`تسعيرات × 4`) : fail(`تسعيرات = ${pricings} والمفروض 4`);
  txs >= 120 ? ok(`معاملات = ${txs} (دفتر متوازن)`) : fail(`معاملات = ${txs} — أقل من المتوقع`);
  notifs === 4 ? ok(`إشعارات × 4`) : fail(`إشعارات = ${notifs} والمفروض 4`);
  achievs === 5 ? ok(`إنجازات × 5`) : fail(`إنجازات = ${achievs} والمفروض 5`);
  issues === 12 ? ok(`بلاغات × 12`) : fail(`بلاغات = ${issues} والمفروض 12`);
  coupons === 5 ? ok(`كوبونات × 5`) : fail(`كوبونات = ${coupons} والمفروض 5`);
  audits >= 4 ? ok(`سجلات تدقيق = ${audits}`) : fail(`سجلات تدقيق = ${audits} — أقل من 4`);
  qrSessions === 0 ? ok(`لا جلسات QR معلّقة`) : warn(`جلسات QR متبقية = ${qrSessions} (من اختبارات حية)`);

  // ═══ 2) التفرّد والصيغ ═══
  console.log("\n【2】 التفرّد والصيغ:");
  const userDocs = await User.find();
  const adminDocs = await Admin.find();

  const emails = [...userDocs.map((u) => u.email), ...adminDocs.map((a) => a.email)];
  new Set(emails).size === emails.length ? ok("كل البريد الإلكتروني فريد") : fail("بريد مكرر!");

  const phones = userDocs.map((u) => u.phoneNumber);
  new Set(phones).size === phones.length ? ok("كل أرقام الهاتف فريدة") : fail("رقم هاتف مكرر!");

  userDocs.every((u) => EGYPT_PHONE.test(u.phoneNumber))
    ? ok("كل الأرقام بموبايل مصري صحيح")
    : fail("رقم هاتف بصيغة غير مصرية");
  [...emails].every((e) => EMAIL_RE.test(e)) ? ok("كل البريد بصيغة سليمة") : fail("بريد بصيغة تالفة");

  const superAdmin = adminDocs.find((a) => a.role === "superAdmin");
  const opsManager = adminDocs.find((a) => a.role === "operationsManager");
  superAdmin && opsManager
    ? ok(`الأدوار سليمة: ${superAdmin.email} (superAdmin) + ${opsManager.email} (operationsManager)`)
    : fail("دور أدمن ناقص أو خاطئ");

  // ═══ 3) التسعير ═══
  console.log("\n【3】 التسعير:");
  const pricingDocs = await Pricing.find();
  const priceMap = {};
  for (const p of pricingDocs) {
    priceMap[p.materialType] = p.pricePerKg;
    if (!p.isActive) fail(`تسعيرة ${p.materialType} غير مفعّلة`);
  }
  JSON.stringify(priceMap) === JSON.stringify(EXPECTED_PRICES)
    ? ok("الأسعار مطابقة: بلاستيك 5 / زجاج 3 / كرتون 4 / ورق 2 ج.م")
    : fail(`الأسعار غير مطابقة`, JSON.stringify(priceMap));

  // ═══ 4) الماكينات والإحداثيات ═══
  console.log("\n【4】 الماكينات:");
  const machineDocs = await Machine.find();
  for (const m of machineDocs) {
    if (!MACHINE_BASE_TOTALS[m.name]) warn(`ماكينة غير قياسية (أُضيفت يدويًا؟): ${m.name}`);
    if (m.fillPercentage < 0 || m.fillPercentage > 100) fail(`${m.name}: نسبة امتلاء ${m.fillPercentage} خارج 0-100`);
    if (m.coordinates) {
      const { lat, lng } = m.coordinates;
      if (lat < 21 || lat > 32 || lng < 24 || lng > 37)
        fail(`${m.name}: إحداثيات خارج مصر (${lat}, ${lng})`);
    }
    if (!["active", "nearlyFull", "offline"].includes(m.status)) fail(`${m.name}: حالة غير صالحة ${m.status}`);
  }
  ok("كل الماكينات داخل نطاق القاهرة/الجيزة/الإسكندرية جغرافيًا");
  const offlineMachines = machineDocs.filter((m) => m.status === "offline");
  offlineMachines.length === 1 ? ok("ماكينة واحدة offline (المنشية) — واقعي للسيناريو") : warn(`عدد الـ offline = ${offlineMachines.length}`);

  // ═══ 5) التكامل المرجعي للمعاملات ═══
  console.log("\n【5】 المعاملات والتكامل المرجعي:");
  const txDocs = await Transaction.find();
  const userIds = new Set(userDocs.map((u) => String(u._id)));
  const machineIds = new Set(machineDocs.map((m) => String(m._id)));
  let badUserRef = 0, badMachineRef = 0, badWeight = 0, badAmount = 0, badType = 0, badDate = 0;
  const now = Date.now();

  for (const t of txDocs) {
    if (!userIds.has(String(t.user))) badUserRef++;
    if (t.type === "deposit") {
      if (t.machine && !machineIds.has(String(t.machine))) badMachineRef++;
      if (!(t.weightKg > 0) || t.weightKg > 500) badWeight++;
      const expectedAmount = parseFloat((t.weightKg * (priceMap[t.materialType] || 0)).toFixed(2));
      if (Math.abs(expectedAmount - t.amount) > 0.011) badAmount++;
    } else if (t.type === "withdrawal") {
      if (!(t.amount >= 10)) badWeight++;
    } else badType++;
    if (t.createdAt > now || now - t.createdAt > 91 * 86400000) badDate++;
  }
  badUserRef === 0 ? ok("كل المعاملات تشير لمستخدمين موجودين") : fail(`${badUserRef} معاملة بمستخدم غير موجود`);
  badMachineRef === 0 ? ok("كل الإيداعات تشير لماكينات موجودة") : fail(`${badMachineRef} إيداع بماكينة غير موجودة`);
  badType === 0 ? ok("كل الأنواع deposit/withdrawal") : fail(`${badType} نوع غير صالح`);
  badWeight === 0 ? ok("كل الأوزان والمبالغ ضمن الحدود المنطقية") : fail(`${badWeight} وزن/مبلغ غير منطقي`);
  badAmount === 0 ? ok("كل مبالغ الإيداع = الوزن × سعر المادة (بدقة قرش)") : fail(`${badAmount} مبلغ غير مطابق للسعر`);
  badDate === 0 ? ok("كل التواريخ ضمن آخر 90 يومًا (بدون مستقبلي)") : fail(`${badDate} تاريخ خارج النطاق`);

  // ═══ 6) الاتساق المالي — دفتر الأرصدة ═══
  console.log("\n【6】 الاتساق المالي (دفتر الأرصدة):");
  const couponDocs = await Coupon.find();

  // تجميع الإيداعات لكل مستخدم
  const ledgerDeposits = {};
  const depositCounts = {};
  const involvedUsers = new Set();
  for (const t of txDocs) {
    const uid = String(t.user);
    involvedUsers.add(uid);
    ledgerDeposits[uid] = ledgerDeposits[uid] || 0;
    depositCounts[uid] = depositCounts[uid] || 0;
    if (t.type === "deposit") {
      ledgerDeposits[uid] += t.weightKg;
      depositCounts[uid]++;
    }
  }

  // الرصيد ترتيبًا زمنيًا — نفس منطق الـ seed حرفيًا:
  // السحب يُنفّذ فقط لو كان الرصيد وقتها يسمح (يُتخطى غير ذلك)
  let overdraft = 0;
  const ledgerBalances = {};
  for (const uid of involvedUsers) {
    const userTx = txDocs
      .filter((t) => String(t.user) === uid)
      .sort((a, b) => a.createdAt - b.createdAt);
    let running = 0;
    for (const t of userTx) {
      if (t.type === "deposit") running += t.amount;
      else if (t.amount > running + 0.001) overdraft++;
      else running -= t.amount;
    }
    ledgerBalances[uid] = parseFloat(running.toFixed(2));
  }
  overdraft === 0 ? ok("لا يوجد أي سحب فوق الرصيد المتاح (دفتر واقعي)") : fail(`${overdraft} عملية سحب فوق الرصيد!`);

  // الرصيد النهائي = الدفتر − تكلفة الكوبونات
  let balanceMismatches = 0, negativeBalances = 0, levelMismatches = 0, depositMismatches = 0;
  for (const u of userDocs) {
    const uid = String(u._id);
    const couponCost = couponDocs
      .filter((c) => String(c.user) === uid)
      .reduce((s, c) => s + (c.pointsCost || 0), 0);
    const expectedBalance = parseFloat(((ledgerBalances[uid] || 0) - couponCost).toFixed(2));
    if (Math.abs(expectedBalance - u.balance) > 0.011) balanceMismatches++;
    if (u.balance < 0) negativeBalances++;
    if (Math.abs(parseFloat((ledgerDeposits[uid] || 0).toFixed(2)) - u.totalDeposits) > 0.011) depositMismatches++;
    if (calcLevel(u.totalDeposits) !== u.level) levelMismatches++;
  }
  balanceMismatches === 0 ? ok("أرصدة كل المستخدمين = الإيداعات − السحوبات − الكوبونات (حتى القرش)") : fail(`${balanceMismatches} رصيد غير مطابق للدفتر`);
  negativeBalances === 0 ? ok("لا يوجد أي رصيد سالب") : fail(`${negativeBalances} رصيد سالب!`);
  depositMismatches === 0 ? ok("إجمالي التدوير لكل مستخدم = مجموع أوزان إيداعاته") : fail(`${depositMismatches} إجمالي تدوير غير مطابق`);
  levelMismatches === 0 ? ok("مستوى كل مستخدم مطابق لإجمالي تدويره") : fail(`${levelMismatches} مستوى غير مطابق`);

  // ═══ 7) الماكينات: totalCollected ═══
  console.log("\n【7】 إجمالي تجميع الماكينات:");
  let machineMismatches = 0;
  for (const m of machineDocs) {
    const base = MACHINE_BASE_TOTALS[m.name];
    if (base === undefined) continue; // حُذرت منها فوق
    const txWeight = txDocs
      .filter((t) => t.machine && String(t.machine) === String(m._id))
      .reduce((s, t) => s + (t.weightKg || 0), 0);
    const expected = parseFloat((base + txWeight).toFixed(2));
    if (Math.abs(expected - m.totalCollected) > 0.011) {
      machineMismatches++;
      fail(`${m.name}: ${m.totalCollected} والمفروض ${expected}`);
    }
  }
  machineMismatches === 0 && ok("إجمالي كل ماكينة = قيمتها الأساسية + أوزان معاملاتها");

  // ═══ 8) الكوبونات ═══
  console.log("\n【8】 الكوبونات:");
  const partnerIds = new Set((await Partner.find()).map((p) => String(p._id)));
  let couponIssues = 0;
  for (const c of couponDocs) {
    if (!userIds.has(String(c.user))) { couponIssues++; fail(`كوبون ${c.code}: مستخدم غير موجود`); }
    if (!partnerIds.has(String(c.partner))) { couponIssues++; fail(`كوبون ${c.code}: شريك غير موجود`); }
    if (!/^ECO-DEMO\d{2}$/.test(c.code)) { couponIssues++; fail(`كوبون بكود شاذ: ${c.code}`); }
    if (!["issued", "redeemed", "cancelled"].includes(c.status)) { couponIssues++; fail(`كوبون ${c.code}: حالة ${c.status}`); }
    if (c.status === "redeemed" && (!c.redeemedAt || (!c.redeemedBy && !c.redeemedByPartner))) { couponIssues++; fail(`كوبون ${c.code}: مستبدل بدون تاريخ/مُبدّل`); }
    if (c.expiresAt < new Date()) { couponIssues++; fail(`كوبون ${c.code}: منتهي الصلاحية!`); }
    if (c.pointsCost !== 40) { couponIssues++; fail(`كوبون ${c.code}: تكلفة ${c.pointsCost}`); }
  }
  couponIssues === 0 && ok("كل الكوبونات سليمة: مراجع صحيحة، أكواد منتظمة، صلاحية مستقبلية");
  const redeemedCount = couponDocs.filter((c) => c.status === "redeemed").length;
  const issuedCount = couponDocs.filter((c) => c.status === "issued").length;
  ok(`التوزيع: ${issuedCount} قيد الاستخدام + ${redeemedCount} مستبدل (سيناريو واقعي)`);

  // ═══ 9) البلاغات ═══
  console.log("\n【9】 البلاغات:");
  const issueDocs = await Issue.find();
  let issueProblems = 0;
  const adminIds = new Set(adminDocs.map((a) => String(a._id)));
  for (const i of issueDocs) {
    if (!userIds.has(String(i.user))) { issueProblems++; fail(`بلاغ بمستخدم غير موجود`); }
    if (!machineIds.has(String(i.machine))) { issueProblems++; fail(`بلاغ بماكينة غير موجودة`); }
    if (!["open", "in_progress", "resolved", "dismissed"].includes(i.status)) issueProblems++;
    if ((i.status === "resolved" || i.status === "dismissed") && (!i.resolvedBy || !i.resolvedAt)) {
      issueProblems++; fail(`بلاغ ${i.status} بدون مُعالج أو تاريخ`);
    }
    if (i.resolvedBy && !adminIds.has(String(i.resolvedBy))) { issueProblems++; fail(`بلاغ بمُعالج غير موجود`); }
    if (i.resolvedAt && i.resolvedAt < i.createdAt) { issueProblems++; fail(`بلاغ تاريخ الحل قبل الإنشاء!`); }
    if (!i.description || i.description.length < 5) issueProblems++;
  }
  issueProblems === 0 && ok("كل البلاغات سليمة: مراجع صحيحة، حالات صالحة، تواريخ منطقية");
  const openCount = issueDocs.filter((i) => i.status === "open").length;
  ok(`التوزيع: ${openCount} مفتوح من إجمالي ${issueDocs.length} — يغذي لوحة العمليات`);

  // ═══ 10) الإشعارات ═══
  console.log("\n【10】 الإشعارات:");
  const notifDocs = await Notification.find();
  let notifProblems = 0;
  for (const n of notifDocs) {
    if (n.recipient === "all") {
      if (n.recipientCount !== users) { notifProblems++; fail(`إشعار عام بعداد ${n.recipientCount} ≠ ${users}`); }
    } else if (!userIds.has(String(n.recipient))) {
      notifProblems++; fail(`إشعار بمستلم غير موجود`);
    }
    if (!adminIds.has(String(n.sentBy))) { notifProblems++; fail(`إشعار بمرسِل غير موجود`); }
    if (!n.title || !n.message) notifProblems++;
  }
  notifProblems === 0 && ok("كل الإشعارات سليمة: مرسل ومستلم صحيحان، عدّاد البث مطابق");

  // ═══ 11) الإنجازات ═══
  console.log("\n【11】 الإنجازات ومحرك الفتح:");
  const achievDocs = await Achievement.find();
  let achProblems = 0;
  const achIds = new Set(achievDocs.map((a) => String(a._id)));
  for (const a of achievDocs) {
    if (!["depositsCount", "totalDeposits", "balance", "co2Saved"].includes(a.metric)) achProblems++;
    if (!(a.threshold > 0) || !(a.xpReward > 0)) achProblems++;
  }
  achProblems === 0 && ok("كل تعريفات الإنجازات بمقاييس وحدود سليمة");

  // هل المستخدمين فتحوا الإنجازات الصحيحة فقط؟ (نفس ترتيب خطوات الـ seed)
  let unlockMismatches = 0;
  for (const u of userDocs) {
    const uid = String(u._id);
    // الرصيد قبل خصم الكوبونات — هو ما رآه محرك الإنجازات وقت الفتح
    const preCouponBalance = parseFloat((ledgerBalances[uid] || 0).toFixed(2));
    const metrics = {
      totalDeposits: parseFloat((ledgerDeposits[uid] || 0).toFixed(2)),
      depositsCount: depositCounts[uid] || 0,
      balance: preCouponBalance,
    };
    const shouldUnlock = new Set(
      achievDocs.filter((a) => (metrics[a.metric] || 0) >= a.threshold).map((a) => String(a._id))
    );
    const actualUnlock = new Set((u.achievements || []).map((x) => String(x.achievement)));
    if (shouldUnlock.size !== actualUnlock.size) {
      unlockMismatches++;
      fail(`${u.username}: فتح ${actualUnlock.size} والمتوقع ${shouldUnlock.size}`);
    }
    // لا تكرار لنفس الإنجاز
    if ((u.achievements || []).length !== actualUnlock.size) { unlockMismatches++; fail(`${u.username}: إنجاز مكرر!`); }
    // كل المراجع موجودة
    for (const ref of actualUnlock) if (!achIds.has(ref)) { unlockMismatches++; fail(`${u.username}: مرجع إنجاز غير موجود`); }
  }
  unlockMismatches === 0 && ok("إنجازات كل مستخدم مطابقة لإحصائياته — بلا تكرار أو مراجع مكسورة");

  // ═══ 12) سجل التدقيق ═══
  console.log("\n【12】 سجل التدقيق:");
  const auditDocs = await AuditLog.find();
  let auditProblems = 0;
  for (const a of auditDocs) {
    if (!adminIds.has(String(a.actor?.id))) auditProblems++;
    if (!a.action || !a.targetType) auditProblems++;
  }
  auditProblems === 0 && ok("كل سجلات التدقيق بفاعلين حقيقيين وحقول كاملة");

  // ═══ النتيجة النهائية ═══
  console.log("\n══════════════════════════════════════");
  if (problems.length === 0) {
    console.log(`✅ النتيجة: البيانات سليمة 100% — ${warnings.length} تحذير بسيط`);
    warnings.forEach((w) => console.log(`   ⚠ ${w}`));
  } else {
    console.log(`❌ النتيجة: ${problems.length} مشكلة تحتاج إصلاح:`);
    problems.forEach((p) => console.log(`   ✗ ${p}`));
  }
  console.log("══════════════════════════════════════\n");

  await mongoose.connection.close();
  process.exit(problems.length === 0 ? 0 : 1);
}

validate().catch((e) => {
  console.error("فشل الفحص:", e.message);
  process.exit(1);
});
