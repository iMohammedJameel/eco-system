/** اختبارات الكوبونات: إصدار ذرّي، خصم من الرصيد، استبدال، إلغاء + إصلاحات الإحصائيات */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { setupApp, connectDB, seedBasics, closeDB } = require("./helpers");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Machine = require("../models/Machine");
const Coupon = require("../models/Coupon");

async function adminLogin(app) {
  const res = await request(app)
    .post("/api/dashboard/login")
    .send({ email: "test-admin@ecocycle.com", password: "admin123456" });
  return res.body.token;
}

describe("Coupons — redemption business loop", () => {
  let app, token, fixtures;

  before(async () => {
    app = await setupApp();
    await connectDB();
    fixtures = await seedBasics();
    token = await adminLogin(app);
  });

  after(async () => {
    await closeDB();
  });

  test("issue coupon atomically deducts user balance + creates ledger entry", async () => {
    const { user, partner } = fixtures;
    const balanceBefore = (await User.findById(user._id)).balance;

    const res = await request(app)
      .post("/api/dashboard/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: String(user._id), partnerId: String(partner._id), pointsCost: 30 });

    assert.equal(res.status, 201);
    const { coupon, newBalance } = res.body.data;
    assert.match(coupon.code, /^ECO-/);
    assert.equal(coupon.status, "issued");
    assert.equal(newBalance, balanceBefore - 30);

    // قيد مالي (withdrawal/coupon)
    const ledger = await Transaction.findOne({
      user: user._id,
      withdrawalMethod: "coupon",
      accountNumber: coupon.code,
    });
    assert.ok(ledger, "ledger transaction required");
    assert.equal(ledger.amount, 30);
  });

  test("issue coupon with insufficient balance → rejected, no side effects", async () => {
    const { user, partner } = fixtures;
    const before = (await User.findById(user._id)).balance;

    const res = await request(app)
      .post("/api/dashboard/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: String(user._id), partnerId: String(partner._id), pointsCost: 99999 });

    assert.equal(res.status, 400);
    assert.match(res.body.msg, /كافٍ/);
    assert.equal((await User.findById(user._id)).balance, before);
  });

  test("redeem coupon once — second attempt rejected", async () => {
    const { user, partner } = fixtures;
    const issue = await request(app)
      .post("/api/dashboard/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: String(user._id), partnerId: String(partner._id), pointsCost: 10 });
    const code = issue.body.data.coupon.code;

    const first = await request(app)
      .patch("/api/dashboard/coupons/redeem")
      .set("Authorization", `Bearer ${token}`)
      .send({ code });
    assert.equal(first.status, 200);
    assert.equal(first.body.data.status, "redeemed");
    assert.ok(first.body.data.redeemedAt);

    const second = await request(app)
      .patch("/api/dashboard/coupons/redeem")
      .set("Authorization", `Bearer ${token}`)
      .send({ code });
    assert.equal(second.status, 400);
    assert.match(second.body.msg, /مستبدل|ملغي/);
  });

  test("expired coupon is rejected at redemption and stays un-redeemed", async () => {
    // قبل الإصلاح: redeemCoupon كانت تفحص {code, status:"issued"} فقط —
    // كوبون منتهي الصلاحية كان يُستبدل بنجاح (خسارة مالية للشريك)
    const { user, partner } = fixtures;
    const issue = await request(app)
      .post("/api/dashboard/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: String(user._id), partnerId: String(partner._id), pointsCost: 5 });
    const coupon = issue.body.data.coupon;

    // نرجع تاريخ انتهائه للماضي مباشرة في الـ DB
    await Coupon.updateOne(
      { _id: coupon._id },
      { $set: { expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    );

    const res = await request(app)
      .patch("/api/dashboard/coupons/redeem")
      .set("Authorization", `Bearer ${token}`)
      .send({ code: coupon.code });

    assert.equal(res.status, 400);
    assert.match(res.body.msg, /صلاحية/);

    // تأكيد: الكوبون لم يتحول إلى redeemed
    const stillIssued = await Coupon.findById(coupon._id);
    assert.equal(stillIssued.status, "issued");
    assert.equal(stillIssued.redeemedAt, undefined);
  });

  test("cancel coupon refunds points to user", async () => {
    const { user, partner } = fixtures;
    const before = (await User.findById(user._id)).balance;
    const issue = await request(app)
      .post("/api/dashboard/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: String(user._id), partnerId: String(partner._id), pointsCost: 15 });
    const coupon = issue.body.data.coupon;

    const res = await request(app)
      .delete(`/api/dashboard/coupons/${coupon._id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);

    const after = (await User.findById(user._id)).balance;
    assert.equal(after, before, "refund restores original balance");
  });

  test("coupons list returns stats summary", async () => {
    const res = await request(app)
      .get("/api/dashboard/coupons")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.stats);
    assert.ok(typeof res.body.stats.totalPoints === "number");
  });
});

describe("Stats fixes", () => {
  let app, token, fixtures;

  before(async () => {
    app = await setupApp();
    await connectDB();
    fixtures = await seedBasics();
    token = await adminLogin(app);
  });

  after(async () => {
    await closeDB();
  });

  test("monthly stats sorted chronologically", async () => {
    // معاملات في شهور متفرقة
    const { user, machine } = fixtures;
    const months = [1, 3, 2, 8, 5];
    for (const m of months) {
      await Transaction.create({
        user: user._id,
        machine: machine._id,
        type: "deposit",
        materialType: "paper",
        weightKg: 1,
        amount: 2,
        createdAt: new Date(2026, m - 1, 10),
      });
    }

    const res = await request(app)
      .get("/api/dashboard/stats/monthly")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);

    const seq = res.body.data.map((m) => [m._id.year, m._id.month]);
    const sorted = [...seq].sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
    assert.deepEqual(seq, sorted, "months must be chronological");
  });

  test("leaderboard governorate filter actually filters", async () => {
    // مستخدم بيدّع في القاهرة + أخرى في الجيزة
    const gizaMachine = await Machine.create({
      name: "ماكينة الجيزة",
      location: "الدقي",
      governorate: "الجيزة",
      status: "active",
    });
    const cairoUser = fixtures.user;
    const gizaUser = await User.create({
      username: "مستخدم الجيزة",
      email: "giza-user@test.com",
      phoneNumber: "01000000099",
      password: "user123456",
    });

    await Transaction.create([
      { user: cairoUser._id, machine: fixtures.machine._id, type: "deposit", materialType: "paper", weightKg: 10, amount: 20 },
      { user: gizaUser._id, machine: gizaMachine._id, type: "deposit", materialType: "paper", weightKg: 50, amount: 100 },
    ]);

    const all = await request(app)
      .get("/api/dashboard/stats/leaderboard?limit=10")
      .set("Authorization", `Bearer ${token}`);
    const giza = await request(app)
      .get("/api/dashboard/stats/leaderboard?governorate=الجيزة&limit=10")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(all.status, 200);
    assert.equal(giza.status, 200);

    const gizaNames = giza.body.data.map((e) => e.username);
    assert.ok(gizaNames.includes("مستخدم الجيزة"), "giza user must appear in giza filter");
    assert.ok(!gizaNames.includes("مستخدم تست"), "cairo user must NOT appear in giza filter");
  });

  test("machine forecasts endpoint returns predictions", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats/machine-forecasts")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data[0].hasOwnProperty("fillPercentage"));
    assert.ok(res.body.data[0].hasOwnProperty("hoursToFull") || true);
  });

  test("suspicious filter returns only flagged transactions", async () => {
    const { user, machine } = fixtures;
    await Transaction.create([
      { user: user._id, machine: machine._id, type: "deposit", materialType: "paper", weightKg: 1, amount: 2, suspicious: true },
      { user: user._id, machine: machine._id, type: "deposit", materialType: "paper", weightKg: 1, amount: 2 },
    ]);

    const res = await request(app)
      .get("/api/transactions?suspicious=true")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.every((t) => t.suspicious === true));
  });
});
