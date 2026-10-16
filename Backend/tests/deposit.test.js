/** اختبارات الإيداع العام (PWA): إيداع ناجح، حساب تلقائي، استخدام مزدوج، إنجازات، ذرّية */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const crypto = require("crypto");
const { setupApp, connectDB, seedBasics, closeDB } = require("./helpers");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const QRSession = require("../models/QRSession");

async function makeQrSession(userId, machineId) {
  return QRSession.create({
    token: crypto.randomBytes(16).toString("hex"),
    user: userId,
    machine: machineId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
}

describe("Public deposit flow (PWA)", () => {
  let app, fixtures;

  before(async () => {
    app = await setupApp();
    await connectDB();
    fixtures = await seedBasics();
  });

  after(async () => {
    await closeDB();
  });

  test("existing phone → deposit credited atomically + achievements engine runs", async () => {
    const { user, machine } = fixtures;
    const session = await makeQrSession(user._id, machine._id);

    const res = await request(app)
      .post("/api/transactions/claim-public")
      .send({
        qrToken: session.token,
        phoneNumber: "01000000001",
        materialType: "plastic",
        weightKg: 4,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.status, "success");
    // 4 كجم × 5 ج.م = 20 جنية + مكافأة إنجاز "أول خطوة" 5 ج.م
    assert.equal(res.body.data.earned, 20);
    assert.equal(res.body.data.newBalance, 125); // 100 + 20 + 5

    const dbUser = await User.findById(user._id);
    assert.equal(dbUser.balance, 125);
    assert.equal(dbUser.totalDeposits, 14); // 10 + 4

    // محرك الإنجازات: "أول خطوة" (depositsCount=1) كان مفروض يفتح
    assert.ok(
      (res.body.data.unlockedAchievements || []).some((a) => a.name === "أول خطوة"),
      "achievement engine should unlock first-step",
    );
  });

  test("new phone → auto account creation", async () => {
    const { machine } = fixtures;
    const session = await makeQrSession(fixtures.user._id, machine._id);

    const res = await request(app)
      .post("/api/transactions/claim-public")
      .send({
        qrToken: session.token,
        phoneNumber: "01122334455",
        materialType: "paper",
        weightKg: 2,
        username: "مستخدم جديد",
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.createdAccount, true);
    assert.equal(res.body.data.user.username, "مستخدم جديد");

    const created = await User.findOne({ phoneNumber: "01122334455" });
    assert.ok(created, "auto-created user must exist in DB");
  });

  test("QR session double-use rejected", async () => {
    const { user, machine } = fixtures;
    const session = await makeQrSession(user._id, machine._id);

    const first = await request(app)
      .post("/api/transactions/claim-public")
      .send({ qrToken: session.token, phoneNumber: "01000000001", materialType: "paper", weightKg: 1 });
    assert.equal(first.status, 201);

    const second = await request(app)
      .post("/api/transactions/claim-public")
      .send({ qrToken: session.token, phoneNumber: "01000000001", materialType: "paper", weightKg: 1 });
    assert.equal(second.status, 400);
    assert.match(second.body.msg, /منتهية|مستخدمة/);
  });

  test("invalid phone rejected", async () => {
    const { user, machine } = fixtures;
    const session = await makeQrSession(user._id, machine._id);

    const res = await request(app)
      .post("/api/transactions/claim-public")
      .send({ qrToken: session.token, phoneNumber: "12345", materialType: "paper", weightKg: 1 });
    assert.equal(res.status, 400);
  });

  test("qr-info is public and safe (no user data leak)", async () => {
    const { user, machine } = fixtures;
    const session = await makeQrSession(user._id, machine._id);

    const res = await request(app)
      .get(`/api/transactions/qr-info?qrToken=${session.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.valid, true);
    assert.equal(res.body.data.machine.name, "ماكينة تست");
    assert.equal(res.body.data.user, undefined, "must not leak user info");
  });

  test("withdrawal with insufficient balance leaves balance untouched (atomic)", async () => {
    const { user } = fixtures;
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "test-user@ecocycle.com", password: "user123456" });
    const token = login.body.token;

    const before = (await User.findById(user._id)).balance;
    const res = await request(app)
      .post("/api/transactions/withdraw")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: before + 500, withdrawalMethod: "bank", accountNumber: "ACC1" });

    assert.equal(res.status, 400);
    assert.match(res.body.msg, /كافٍ/);
    const after = (await User.findById(user._id)).balance;
    assert.equal(after, before, "balance must not change on failed withdrawal");
  });
});
