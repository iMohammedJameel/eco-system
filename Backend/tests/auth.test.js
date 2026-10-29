/** اختبارات المصادقة: دخول ناجح، فشل، قفل الحساب، تجديد التوكن */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { setupApp, connectDB, seedBasics, closeDB } = require("./helpers");
const Admin = require("../models/Admin");
const User = require("../models/User");

describe("Auth — admin login + lockout + refresh", () => {
  let app, admin;

  before(async () => {
    app = await setupApp();
    await connectDB();
    ({ admin } = await seedBasics());
  });

  after(async () => {
    await closeDB();
  });

  test("successful login returns access token + admin profile + refresh cookie", async () => {
    const res = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456" });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, "success");
    assert.ok(res.body.token, "token required");
    assert.equal(res.body.admin.role, "superAdmin");
    assert.ok(
      res.headers["set-cookie"]?.some((c) => c.startsWith("ecocycle_admin_rt=")),
      "httpOnly refresh cookie required",
    );
  });

  test("wrong password rejected", async () => {
    const res = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "wrongpass" });
    assert.equal(res.status, 400);
    assert.equal(res.body.status, "error");
  });

  test("5 failed attempts lock the account for 15 minutes", async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/dashboard/login")
        .send({ email: "test-admin@ecocycle.com", password: "wrongpass" });
    }
    const res = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456" });

    assert.equal(res.status, 423);
    assert.match(res.body.msg, /مقفول/);

    const dbAdmin = await Admin.findById(admin._id).select("+lockUntil");
    assert.ok(dbAdmin.lockUntil && dbAdmin.lockUntil > new Date());
  });

  test("refresh endpoint issues new access token from cookie", async () => {
    // نفك أي قفل من تيست القفل السابق
    await Admin.updateOne(
      { _id: admin._id },
      { $set: { lockUntil: null, loginAttempts: 0 } },
    );
    const login = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456" });
    assert.equal(login.status, 200);
    const cookie = login.headers["set-cookie"]?.find((c) =>
      c.startsWith("ecocycle_admin_rt="),
    );
    assert.ok(cookie, "login must set refresh cookie");

    const res = await request(app).post("/api/dashboard/refresh").set("Cookie", cookie);
    assert.equal(res.status, 200);
    assert.ok(res.body.token, "refreshed token required");
  });

  test("refresh without cookie rejected 401", async () => {
    const res = await request(app).post("/api/dashboard/refresh");
    assert.equal(res.status, 401);
  });

  test("user login returns short-lived token + httpOnly refresh cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test-user@ecocycle.com", password: "user123456" });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    // الـ refresh بقى httpOnly cookie (غير قابل للسرقة عبر XSS) — مش في الـ body
    assert.equal(res.body.refreshToken, undefined);
    const cookie = res.headers["set-cookie"]?.find((c) =>
      c.startsWith("ecocycle_user_rt="),
    );
    assert.ok(cookie, "login must set user refresh cookie");
    assert.match(cookie, /HttpOnly/i);
  });

  test("user refresh cookie issues a new access token + rotates", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "test-user@ecocycle.com", password: "user123456" });
    const cookie = login.headers["set-cookie"]
      ?.find((c) => c.startsWith("ecocycle_user_rt="))
      ?.split(";")[0];

    const refresh = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", cookie);
    assert.equal(refresh.status, 200);
    assert.ok(refresh.body.token);
    // تدوير: سيرفر بيرجّع كوكي جديد صالح (نفس الثانية ممكن يطابق القديم نصيًا
    // لأن iat بثانية واحدة — فالمهم وجود الكوكي + صلاحية التوكن الجديد)
    const rotated = refresh.headers["set-cookie"]?.find((c) =>
      c.startsWith("ecocycle_user_rt="),
    );
    assert.ok(rotated);
    assert.match(rotated, /HttpOnly/i);

    // التوكن الجديد شغال فعلاً على مسار محمي
    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${refresh.body.token}`);
    assert.equal(me.status, 200);
  });

  test("refresh token cannot be used as an access token", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "test-user@ecocycle.com", password: "user123456" });
    // استخراج الـ refresh token من الكوكي — ممنوع يشتغل كـ Bearer
    const raw = login.headers["set-cookie"]
      ?.find((c) => c.startsWith("ecocycle_user_rt="))
      ?.split(";")[0]
      ?.split("=")[1];
    assert.ok(raw);
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${raw}`);
    assert.equal(res.status, 401);
  });

  test("register rejects duplicate phone number with clean 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "تليفون مكرر",
        email: "dup-phone@ecocycle.com",
        phoneNumber: "01000000001",
        password: "user123456",
      });
    assert.equal(res.status, 400);
    assert.match(res.body.msg, /هاتف/);
  });

  test("updateMe with a phone owned by another account gets clean 400 (not 500)", async () => {
    // مستخدم آخر يستحوذ على تليفون مختلف
    await User.create({
      username: "صاحب التليفون الآخر",
      email: "other-phone@ecocycle.com",
      phoneNumber: "01000000002",
      password: "user123456",
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "test-user@ecocycle.com", password: "user123456" });
    const userToken = login.body.token;

    // قبل الإصلاح: E11000 من الـ unique index كانت تطلع 500
    const res = await request(app)
      .put("/api/auth/me")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ phoneNumber: "01000000002" });

    assert.equal(res.status, 400);
    assert.match(res.body.msg, /هاتف/);
  });

  /* ═══ "تذكرني" — منطق الجلسة الحقيقي ═══ */

  test("remember=true grants a 30-day persistent refresh cookie", async () => {
    const res = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456", remember: true });
    assert.equal(res.status, 200);
    const cookie = res.headers["set-cookie"]?.find((c) =>
      c.startsWith("ecocycle_admin_rt="),
    );
    assert.ok(cookie, "remember login must set refresh cookie");
    // كوكيز دائم بـ Max-Age = 30 يومًا
    assert.match(cookie, /Max-Age=2592000/i);
    // التوكن نفسه صالح 30 يومًا (exp - iat ≥ 29 يومًا)
    const raw = cookie.split("=")[1].split(";")[0];
    const payload = JSON.parse(Buffer.from(raw.split(".")[1], "base64").toString());
    assert.ok(payload.exp - payload.iat >= 29 * 24 * 3600, "refresh token must live 30 days");
  });

  test("remember=false (default) grants a session cookie without Max-Age", async () => {
    const res = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456" });
    assert.equal(res.status, 200);
    const cookie = res.headers["set-cookie"]?.find((c) =>
      c.startsWith("ecocycle_admin_rt="),
    );
    assert.ok(cookie);
    // كوكيز جلسة — بلا Max-Age (ينتهي مع إغلاق المتصفح)
    assert.doesNotMatch(cookie, /Max-Age/i);
  });

  /* ═══ استعادة كلمة المرور — التحقق المزدوج ═══ */

  test("forgot-password with wrong verification data gets generic 400", async () => {
    const res = await request(app)
      .post("/api/dashboard/forgot-password")
      .send({ email: "test-admin@ecocycle.com", verify: "اسم غلط تمامًا" });
    assert.equal(res.status, 400);
    assert.match(res.body.msg, /التحقق/);
    // لا يُعاد أي رمز استعادة
    assert.equal(res.body.resetToken, undefined);
  });

  test("forgot + reset flow restores admin password end-to-end", async () => {
    // الخطوة 1: البريد + اسم المستخدم الصحيح
    const forgot = await request(app)
      .post("/api/dashboard/forgot-password")
      .send({ email: "test-admin@ecocycle.com", verify: "تست أدمن" });
    assert.equal(forgot.status, 200);
    assert.ok(forgot.body.resetToken, "resetToken required after verification");

    // الخطوة 2: تعيين كلمة مرور جديدة
    const reset = await request(app)
      .post("/api/dashboard/reset-password")
      .send({ resetToken: forgot.body.resetToken, newPassword: "newpass123456" });
    assert.equal(reset.status, 200);
    assert.match(reset.body.msg, /تغيير كلمة المرور|تم تغيير/);

    // الدخول بكلمة المرور الجديدة ينجح، والقديمة تُرفض
    const loginNew = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "newpass123456" });
    assert.equal(loginNew.status, 200);

    const loginOld = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456" });
    assert.equal(loginOld.status, 400);

    // إعادة كلمة المرور الأصلية للتيستات التالية
    const adminDoc = await Admin.findById(admin._id).select("+password");
    adminDoc.password = "admin123456";
    await adminDoc.save();
  });

  test("reset token is one-time and short-lived — cannot serve as access token", async () => {
    const forgot = await request(app)
      .post("/api/dashboard/forgot-password")
      .send({ email: "test-admin@ecocycle.com", verify: "تست أدمن" });
    const token = forgot.body.resetToken;
    assert.ok(token);

    // التوكن ممنوع يعمل access على أي مسار محمي
    const protectedRes = await request(app)
      .get("/api/dashboard/machines")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(protectedRes.status, 401);
  });

  test("reset with an invalid token is rejected 401", async () => {
    const res = await request(app)
      .post("/api/dashboard/reset-password")
      .send({ resetToken: "faketoken1234567890abcdef", newPassword: "whatever123" });
    assert.equal(res.status, 401);
  });

  /* ═══ تعريب رسائل الأخطاء ═══ */

  test("login error messages are in Arabic", async () => {
    const res = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "wrongpass" });
    assert.equal(res.status, 400);
    assert.match(res.body.msg, /[\u0600-\u06FF]/);
  });

  test("Joi validation errors are translated to Arabic", async () => {
    // دخول حقيقي لجلب توكن صالح أولًا
    const login = await request(app)
      .post("/api/dashboard/login")
      .send({ email: "test-admin@ecocycle.com", password: "admin123456" });
    assert.equal(login.status, 200);

    // lat/lng خارج النطاق — كانت بتوصل إنجليزي خام
    const res = await request(app)
      .post("/api/dashboard/machines")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "ماكينة اختبار", location: "اختبار", governorate: "القاهرة", coordinates: { lat: 999, lng: 999 } });
    assert.equal(res.status, 400);
    assert.match(res.body.msg, /[\u0600-\u06FF]/);
    assert.doesNotMatch(res.body.msg, /lat must be/i);
  });
});
