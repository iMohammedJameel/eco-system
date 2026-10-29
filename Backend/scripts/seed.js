/**
 * EcoCycle — Full Demo Seed Script
 *
 * Seeds:
 *  - 1 Super Admin
 *  - 1 Operations Manager
 *  - 4 Pricing records (plastic, glass, cardboard, paper)
 *  - 5 Machines across Egyptian governorates
 *  - 4 Partners (supermarket, electronics, pharmacy, services)
 *  - 10 Demo Users (with hashed passwords)
 *  - ~150 Transactions (mix of deposits + withdrawals — balanced ledger)
 *
 * Usage:   npm run seed
 * Idempotent — safe to run multiple times (drops EcoCycle-owned collections first).
 * الدفتر متسق 100%: كل سحب مسجّل مغطى برصيد سابق — تحقق بنفسك: npm run validate:seed
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

const MATERIAL_TYPES = ["plastic", "glass", "cardboard", "paper"];

// ---------- Data fixtures ----------
const adminData = {
  username: "Super Admin",
  email: process.env.ADMIN_EMAIL || "admin@ecocycle.com",
  password: process.env.ADMIN_PASSWORD || "admin123456",
  role: "superAdmin",
};

const opsManagerData = {
  username: "مدير العمليات",
  email: "ops@ecocycle.com",
  password: "ops123456",
  role: "operationsManager",
};

const defaultPricing = [
  { materialType: "plastic", pricePerKg: 5, currency: "EGP", isActive: true },
  { materialType: "glass", pricePerKg: 3, currency: "EGP", isActive: true },
  { materialType: "cardboard", pricePerKg: 4, currency: "EGP", isActive: true },
  { materialType: "paper", pricePerKg: 2, currency: "EGP", isActive: true },
];

const machines = [
  {
    name: "إيكوسايكل — محطة مترو المعادي",
    location: "المعادي، القاهرة",
    governorate: "القاهرة",
    coordinates: { lat: 29.9602, lng: 31.2569 },
    status: "active",
    fillPercentage: 22,
    totalCollected: 340,
  },
  {
    name: "إيكوسايكل — سيتي ستارز هليوبوليس",
    location: "مصر الجديدة، القاهرة",
    governorate: "القاهرة",
    coordinates: { lat: 30.0808, lng: 31.3297 },
    status: "nearlyFull",
    fillPercentage: 88,
    totalCollected: 720,
  },
  {
    name: "إيكوسايكل — فرع المهندسين",
    location: "المهندسين، الجيزة",
    governorate: "الجيزة",
    coordinates: { lat: 30.0626, lng: 31.2003 },
    status: "active",
    fillPercentage: 45,
    totalCollected: 510,
  },
  {
    name: "إيكوسايكل — سان ستيفانو بلازا",
    location: "سان ستيفانو، الإسكندرية",
    governorate: "الإسكندرية",
    coordinates: { lat: 31.2437, lng: 29.9745 },
    status: "active",
    fillPercentage: 17,
    totalCollected: 180,
  },
  {
    name: "إيكوسايكل — ميدان المنشية",
    location: "المنشية، الإسكندرية",
    governorate: "الإسكندرية",
    coordinates: { lat: 31.1932, lng: 29.8893 },
    status: "offline",
    fillPercentage: 0,
    totalCollected: 95,
  },
  {
    name: "إيكوسايكل — مدينة نصر",
    location: "مدينة نصر، القاهرة",
    governorate: "القاهرة",
    coordinates: { lat: 30.0565, lng: 31.3302 },
    status: "active",
    fillPercentage: 34,
    totalCollected: 265,
  },
  {
    name: "إيكوسايكل — الزمالك",
    location: "الزمالك، القاهرة",
    governorate: "القاهرة",
    coordinates: { lat: 30.0609, lng: 31.2197 },
    status: "active",
    fillPercentage: 52,
    totalCollected: 430,
  },
  {
    name: "إيكوسايكل — الدقي",
    location: "الدقي، الجيزة",
    governorate: "الجيزة",
    coordinates: { lat: 30.0381, lng: 31.2113 },
    status: "active",
    fillPercentage: 61,
    totalCollected: 380,
  },
];

const partners = [
  {
    name: "أسواق كازيون",
    category: "supermarket",
    contactEmail: "support@kazyon.com",
    contactPhone: "19009",
    website: "https://kazyon.com",
    address: "مدينة نصر، القاهرة",
    governorate: "القاهرة",
    isActive: true,
    password: "partner123456",
    discountOffers: [
      {
        title: "خصم 10% على البقالة",
        description: "استبدل نقاط التدوير بخصم 10% على مشترياتك القادمة",
        discountType: "percentage",
        discountValue: 10,
        minSpend: 100,
        validUntil: new Date("2026-12-31"),
        isActive: true,
      },
    ],
  },
  {
    name: "بي تيك B.TECH",
    category: "electronics",
    contactEmail: "support@btech.com",
    contactPhone: "19033",
    website: "https://btech.com",
    address: "ميدان التحرير، القاهرة",
    governorate: "القاهرة",
    isActive: true,
    password: "partner123456",
    discountOffers: [
      {
        title: "خصم 200 ج.م على الإلكترونيات",
        description: "احصل على خصم 200 ج.م عند الشراء بـ 2000 ج.م أو أكثر",
        discountType: "fixed",
        discountValue: 200,
        minSpend: 2000,
        validUntil: new Date("2026-09-30"),
        isActive: true,
      },
    ],
  },
  {
    name: "صيدليات العزبي",
    category: "pharmacy",
    contactEmail: "info@ezaby.com",
    contactPhone: "19800",
    website: "https://ezaby.com",
    address: "سموحة، الإسكندرية",
    governorate: "الإسكندرية",
    isActive: true,
    password: "partner123456",
    discountOffers: [
      {
        title: "خصم 15% على الفيتامينات",
        description: "تدوير صحي — خصم 15% على كل الفيتامينات",
        discountType: "percentage",
        discountValue: 15,
        minSpend: 50,
        validUntil: new Date("2026-08-31"),
        isActive: true,
      },
    ],
  },
  {
    name: "فودافون مصر",
    category: "services",
    contactEmail: "support@vodafone.com.eg",
    contactPhone: "888",
    website: "https://vodafone.com.eg",
    address: "القرية الذكية، الجيزة",
    governorate: "الجيزة",
    isActive: true,
    password: "partner123456",
    discountOffers: [
      {
        title: "شحن 30 ج.م لموبايلك",
        description: "حوّل مكافآت التدوير إلى رصيد موبايل",
        discountType: "fixed",
        discountValue: 30,
        minSpend: 30,
        validUntil: new Date("2026-12-31"),
        isActive: true,
      },
    ],
  },
];

const demoUsers = [
  { username: "أحمد محمود", email: "user1@ecocycle.com", phoneNumber: "01000000001", password: "user123456" },
  { username: "سارة عبد الرحمن", email: "user2@ecocycle.com", phoneNumber: "01000000002", password: "user123456" },
  { username: "محمد حسن", email: "user3@ecocycle.com", phoneNumber: "01000000003", password: "user123456" },
  { username: "نورهان علي", email: "user4@ecocycle.com", phoneNumber: "01000000004", password: "user123456" },
  { username: "عمر خالد", email: "user5@ecocycle.com", phoneNumber: "01000000005", password: "user123456" },
  { username: "مريم صبري", email: "user6@ecocycle.com", phoneNumber: "01000000006", password: "user123456" },
  { username: "يوسف طارق", email: "user7@ecocycle.com", phoneNumber: "01000000007", password: "user123456" },
  { username: "هبة مصطفى", email: "user8@ecocycle.com", phoneNumber: "01000000008", password: "user123456" },
  { username: "كريم عادل", email: "user9@ecocycle.com", phoneNumber: "01000000009", password: "user123456" },
  { username: "دينا فؤاد", email: "user10@ecocycle.com", phoneNumber: "01000000010", password: "user123456" },
];

// ---------- Notifications fixtures ----------
const notificationFixtures = (adminId, userDocs) => [
  {
    title: "عرض خاص: ضاعف نقاطك هذا الأسبوع!",
    message: "احصل على ضعف النقاط عند إعادة تدوير البلاستيك في جميع ماكينات EcoCycle حتى نهاية الأسبوع.",
    type: "promo",
    recipient: "all",
    recipientCount: userDocs.length,
    sentBy: adminId,
  },
  {
    title: "ماكينة جديدة في منطقتك",
    message: "تمت إضافة ماكينة EcoCycle جديدة في مدينة نصر. زرها الآن وابدأ التدوير!",
    type: "system",
    recipient: "all",
    recipientCount: userDocs.length,
    sentBy: adminId,
  },
  {
    title: "تنبيه: الماكينة في وضع الصيانة",
    message: "ماكينة الإسكندرية - منشية حالياً خارج الخدمة للصيانة الدورية.",
    type: "machine_alert",
    recipient: "all",
    recipientCount: userDocs.length,
    sentBy: adminId,
  },
  {
    title: "تم إيداع نقاطك بنجاح",
    message: "تم إضافة 25 جنيه إلى رصيدك من آخر عملية تدوير.",
    type: "earnings",
    recipient: userDocs[0]?._id || null,
    recipientCount: 1,
    sentBy: adminId,
  },
];

// ---------- Achievements fixtures ----------
const achievementFixtures = [
  {
    name: "أول خطوة",
    description: "أول عملية تدوير لك في EcoCycle",
    icon: "sprout",
    metric: "depositsCount",
    threshold: 1,
    xpReward: 5,
    badgeColor: "#a9c7b6",
    isActive: true,
  },
  {
    name: "صديق البيئة النشط",
    description: "وصلت إلى 20 كجم من النفايات المعاد تدويرها",
    icon: "leaf",
    metric: "totalDeposits",
    threshold: 20,
    xpReward: 25,
    badgeColor: "#5f9d78",
    isActive: true,
  },
  {
    name: "بطل التدوير",
    description: "وصلت إلى 50 كجم من النفايات المعاد تدويرها",
    icon: "trophy",
    metric: "totalDeposits",
    threshold: 50,
    xpReward: 75,
    badgeColor: "#166d37",
    isActive: true,
  },
  {
    name: "أسطورة EcoCycle",
    description: "وصلت إلى 100 كجم من النفايات المعاد تدويرها",
    icon: "gem",
    metric: "totalDeposits",
    threshold: 100,
    xpReward: 200,
    badgeColor: "#0b4f2c",
    isActive: true,
  },
  {
    name: "جامع الثروة",
    description: "وصل رصيدك إلى 100 جنيه",
    icon: "coins",
    metric: "balance",
    threshold: 100,
    xpReward: 50,
    badgeColor: "#5f9d78",
    isActive: true,
  },
];

// ---------- Issues fixtures ----------
const ISSUE_TYPES = ["broken", "full", "jammed", "dirty", "rejected_item", "other"];
const ISSUE_DESCRIPTIONS = {
  broken: "الماكينة لا تعمل ولا تستقبل أي مواد.",
  full: "الماكينة ممتلئة بالكامل ولا تقبل المزيد.",
  jammed: "الماكينة عالقة وتحتاج إعادة تشغيل.",
  dirty: "الماكينة متسخة وتحتاج تنظيف.",
  rejected_item: "الماكينة رفضت مادة صالحة للتدوير.",
  other: "مشكلة أخرى تحتاج فحص.",
};

// ---------- Helpers ----------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function calcLevel(totalKg) {
  if (totalKg >= 100) return "excellent";
  if (totalKg >= 50) return "good";
  if (totalKg >= 20) return "active";
  return "beginner";
}

// ---------- Seed runner ----------
const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ DB Is Connected");

    // Clean EcoCycle-owned collections (idempotent re-runs)
    await Promise.all([
      Admin.deleteMany({}),
      User.deleteMany({}),
      Machine.deleteMany({}),
      Partner.deleteMany({}),
      Pricing.deleteMany({}),
      Transaction.deleteMany({}),
      QRSession.deleteMany({}),
      Notification.deleteMany({}),
      Achievement.deleteMany({}),
      Issue.deleteMany({}),
      Coupon.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log("✓ Cleared existing collections");

    // 1. Admins
    const superAdmin = await Admin.create(adminData);
    const opsManager = await Admin.create(opsManagerData);
    console.log(`✓ Created admins: ${superAdmin.email}, ${opsManager.email}`);

    // 2. Pricing
    const pricingDocs = await Pricing.insertMany(
      defaultPricing.map((p) => ({ ...p, updatedBy: superAdmin._id })),
    );
    const priceMap = Object.fromEntries(
      pricingDocs.map((p) => [p.materialType, p.pricePerKg]),
    );
    console.log(`✓ Created ${pricingDocs.length} pricing records`);

    // 3. Machines
    const machineDocs = await Machine.insertMany(machines);
    console.log(`✓ Created ${machineDocs.length} machines`);

    // 4. Partners — create() لتشغيل pre("save") hook (هاش كلمة مرور بوابة الشركاء)
    const partnerDocs = [];
    for (const p of partners) {
      const created = await Partner.create(p);
      partnerDocs.push(created);
    }
    console.log(`✓ Created ${partnerDocs.length} partners (with portal login)`);

    // 5. Users — use create() to trigger pre("save") hook for password hashing
    const userDocs = [];
    for (const u of demoUsers) {
      const created = await User.create(u);
      userDocs.push(created);
    }
    console.log(`✓ Created ${userDocs.length} demo users`);

    // 6. Transactions — مرشّحون أكثر من الهدف لأن الفلترة المالية بتستبعد
    // السحوبات غير المغطاة (دفتر متسق) — الناتج النهائي ~150 عملية
    const candidates = [];
    const now = Date.now();
    for (let i = 0; i < 190; i++) {
      const user = pick(userDocs);
      const machine = pick(machineDocs.filter((m) => m.status !== "offline")) || machineDocs[0];
      const isDeposit = Math.random() > 0.3;

      if (isDeposit) {
        const materialType = pick(MATERIAL_TYPES);
        const weightKg = rand(0.5, 8);
        const amount = parseFloat((weightKg * priceMap[materialType]).toFixed(2));
        const daysAgo = Math.floor(Math.random() * 90);
        const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
        candidates.push({
          user: user._id,
          machine: machine._id,
          type: "deposit",
          materialType,
          weightKg,
          itemsCount: Math.floor(rand(2, 30)),
          amount,
          createdAt,
        });
      } else {
        const amount = rand(10, 100);
        const daysAgo = Math.floor(Math.random() * 90);
        const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
        candidates.push({
          user: user._id,
          type: "withdrawal",
          amount,
          withdrawalMethod: pick(["bank", "mobile_wallet"]),
          accountNumber: `ACC-${user.phoneNumber}`,
          createdAt,
        });
      }
    }

    // الترتيب الزمني ثم الفلترة المالية — نفس منطق الدفتر
    const chronological = candidates.sort((a, b) => a.createdAt - b.createdAt);
    const runningBalance = {};
    const transactions = [];
    for (const t of chronological) {
      const uid = String(t.user);
      runningBalance[uid] = runningBalance[uid] || 0;
      if (t.type === "deposit") {
        runningBalance[uid] += t.amount;
        transactions.push(t);
      } else if (t.amount <= runningBalance[uid]) {
        runningBalance[uid] -= t.amount;
        transactions.push(t);
      }
      // سحب فوق الرصيد يُستبعد كليًا — لا يُسجَّل ما لم يُنفَّذ
    }
    const txDocs = await Transaction.insertMany(transactions);

    // 7. Recompute user balances + totalDeposits + level من المعاملات (ترتيب زمني واقعي — بدون أرصدة سالبة)
    for (const user of userDocs) {
      const userTx = txDocs
        .filter((t) => t.user.toString() === user._id.toString())
        .sort((a, b) => a.createdAt - b.createdAt);
      let balance = 0;
      let totalDeposits = 0;
      for (const t of userTx) {
        if (t.type === "deposit") {
          balance += t.amount;
          totalDeposits += t.weightKg;
        } else if (t.amount <= balance) {
          // سحب يحدث فقط لو الرصيد وقتها يسمح (دفتر واقعي)
          balance -= t.amount;
        }
      }
      user.balance = parseFloat(balance.toFixed(2));
      user.totalDeposits = parseFloat(totalDeposits.toFixed(2));
      user.level = calcLevel(user.totalDeposits);
      await user.save();
    }

    // 8. Recompute machine totalCollected (don't override seed values, just add transactions)
    for (const machine of machineDocs) {
      const machineTx = txDocs.filter(
        (t) => t.machine && t.machine.toString() === machine._id.toString(),
      );
      const extraWeight = machineTx.reduce((sum, t) => sum + (t.weightKg || 0), 0);
      machine.totalCollected = parseFloat((machine.totalCollected + extraWeight).toFixed(2));
      await machine.save();
    }

    console.log(`✓ Created ${txDocs.length} transactions (دفتر متسق — لا سحب فوق الرصيد)`);

    // 9. Notifications (after users exist so recipientCount is accurate)
    const notifDocs = await Notification.insertMany(notificationFixtures(superAdmin._id, userDocs));
    console.log(`✓ Created ${notifDocs.length} notifications`);

    // 10. Achievements
    const achievementDocs = await Achievement.insertMany(achievementFixtures);
    console.log(`✓ Created ${achievementDocs.length} achievements`);

    // 11. Issues — generate ~12 random issue reports across machines/users
    const issueDocs = [];
    const issueStatuses = ["open", "in_progress", "resolved", "dismissed"];
    const issuePriorities = ["low", "medium", "high"];
    for (let i = 0; i < 12; i++) {
      const user = pick(userDocs);
      const machine = pick(machineDocs);
      const type = pick(ISSUE_TYPES);
      const status = pick(issueStatuses);
      const priority = pick(issuePriorities);
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      issueDocs.push({
        user: user._id,
        machine: machine._id,
        type,
        description: ISSUE_DESCRIPTIONS[type],
        priority,
        status,
        adminNotes: status === "resolved" ? "تم الصيانة بنجاح وإعادة تشغيل الماكينة." :
                    status === "dismissed" ? "تم التحقق ووجد أن البلاغ غير دقيق." :
                    status === "in_progress" ? "تم إرسال فريق الصيانة للموقع." : "",
        resolvedBy: (status === "resolved" || status === "dismissed") ? superAdmin._id : undefined,
        resolvedAt: (status === "resolved" || status === "dismissed") ?
          new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) : undefined,
        createdAt,
      });
    }
    const insertedIssues = await Issue.insertMany(issueDocs);
    console.log(`✓ Created ${insertedIssues.length} machine issue reports`);

    // 12. فتح الإنجازات تلقائيًا حسب إحصائيات كل مستخدم
    let unlockedCount = 0;
    for (const user of userDocs) {
      const depositsCount = txDocs.filter(
        (t) => t.user.toString() === user._id.toString() && t.type === "deposit",
      ).length;
      const metrics = {
        totalDeposits: user.totalDeposits,
        depositsCount,
        balance: user.balance,
        co2Saved: user.totalDeposits * 0.5,
      };
      for (const ach of achievementDocs) {
        if ((metrics[ach.metric] || 0) >= ach.threshold) {
          user.achievements = user.achievements || [];
          user.achievements.push({ achievement: ach._id, unlockedAt: new Date(now - Math.random() * 20 * 86400000) });
          unlockedCount++;
        }
      }
      await user.save();
    }
    console.log(`✓ Unlocked ${unlockedCount} achievements across users`);

    // 13. كوبونات تجريبية — حلقة الاستبدال
    const activeUsers = userDocs.filter((u) => u.balance >= 40).slice(0, 5);
    const couponFixtures = [];
    const couponStates = ["issued", "issued", "redeemed", "issued", "redeemed"];
    activeUsers.forEach((u, i) => {
      const partner = partnerDocs[i % partnerDocs.length];
      const offer = partner.discountOffers[0];
      const pointsCost = 40;
      couponFixtures.push({
        code: `ECO-DEMO${String(i + 1).padStart(2, "0")}`,
        user: u._id,
        partner: partner._id,
        offer: {
          title: offer.title,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          minSpend: offer.minSpend || 0,
        },
        pointsCost,
        status: couponStates[i],
        issuedBy: opsManager._id,
        expiresAt: new Date(now + 30 * 86400000),
        redeemedAt: couponStates[i] === "redeemed" ? new Date(now - 5 * 86400000) : undefined,
        redeemedBy: couponStates[i] === "redeemed" ? opsManager._id : undefined,
        createdAt: new Date(now - (i + 2) * 86400000),
      });
      u.balance = parseFloat((u.balance - pointsCost).toFixed(2));
    });
    await Coupon.insertMany(couponFixtures);
    for (const u of activeUsers) await u.save();
    console.log(`✓ Created ${couponFixtures.length} demo coupons`);

    // 14. سجل تدقيق تجريبي
    const auditFixtures = [
      {
        actor: { id: superAdmin._id, name: "Super Admin", role: "superAdmin" },
        action: "auth.login",
        targetType: "auth",
        targetLabel: "Super Admin",
        ip: "127.0.0.1",
        createdAt: new Date(now - 2 * 3600000),
      },
      {
        actor: { id: opsManager._id, name: "مدير العمليات", role: "operationsManager" },
        action: "machine.create",
        targetType: "machine",
        targetLabel: "إيكوسايكل — الزمالك",
        ip: "127.0.0.1",
        createdAt: new Date(now - 6 * 3600000),
      },
      {
        actor: { id: opsManager._id, name: "مدير العمليات", role: "operationsManager" },
        action: "coupon.issue",
        targetType: "coupon",
        targetLabel: "ECO-DEMO01 → أحمد محمود @ أسواق كازيون",
        meta: { pointsCost: 40, offer: "خصم 10% على البقالة" },
        ip: "127.0.0.1",
        createdAt: new Date(now - 86400000),
      },
      {
        actor: { id: superAdmin._id, name: "Super Admin", role: "superAdmin" },
        action: "pricing.update",
        targetType: "pricing",
        targetLabel: "plastic",
        meta: { pricePerKg: 5 },
        ip: "127.0.0.1",
        createdAt: new Date(now - 3 * 86400000),
      },
    ];
    await AuditLog.insertMany(auditFixtures);
    console.log(`✓ Created ${auditFixtures.length} audit log entries`);

    console.log("\n=== Seed Complete ===");
    console.log(`Admin login:    ${adminData.email} / ${adminData.password}`);
    console.log(`Ops login:      ${opsManagerData.email} / ${opsManagerData.password}`);
    console.log(`Demo user:      ${demoUsers[0].email} / ${demoUsers[0].password}`);
    console.log(`Partner login:  ${partners[0].contactEmail} / ${partners[0].password}`);
  } catch (error) {
    console.error("✗ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("✓ DB Is Closed");
    process.exit(0);
  }
};

seedAll();
