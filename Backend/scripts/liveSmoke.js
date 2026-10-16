/**
 * EcoCycle — Live Smoke Test Suite (سيرفر حي على المنفذ 4000)
 * يغطي: كل مسارات المصادقة الجديدة + RBAC + CRUD + PWA
 */
const BASE = "http://127.0.0.1:4000/api";

let passed = 0, failed = 0;
const results = [];
function check(name, cond, extra = "") {
  if (cond) { passed++; results.push(`  ✓ ${name}`); }
  else { failed++; results.push(`  ✗ ${name}${extra ? " — " + extra : ""}`); }
}

async function req(method, path, { body, token, cookie } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  const text = await res.text();
  if (text) { try { json = JSON.parse(text); } catch { json = { msg: text }; } }
  const setCookie = res.headers.get("set-cookie");
  return { status: res.status, json, setCookie };
}

(async () => {
  console.log("\n════════ EcoCycle Live Smoke Tests ════════\n");

  /* ═══ 1) المصادقة — الإدارة ═══ */
  console.log("【1】 مصادقة الإدارة:");

  // دخول عادي (بدون تذكرني) — كوكيز جلسة
  let r = await req("POST", "/dashboard/login", { body: { email: "admin@ecocycle.com", password: "admin123456" } });
  check("دخول أدمن ناجح 200", r.status === 200 && r.json?.token);
  check("بروفايل الأدمن موجود (superAdmin)", r.json?.admin?.role === "superAdmin");
  check("كوكيز جلسة بدون Max-Age (تذكرني غير مفعل)", r.setCookie && !/Max-Age/i.test(r.setCookie), r.setCookie || "");
  const adminToken = r.json?.token;

  // دخول بتذكرني — كوكيز 30 يوم
  r = await req("POST", "/dashboard/login", { body: { email: "admin@ecocycle.com", password: "admin123456", remember: true } });
  check("دخول بتذكرني ناجح", r.status === 200);
  check("كوكيز دائم Max-Age=30 يوم", r.setCookie && /Max-Age=2592000/i.test(r.setCookie), r.setCookie || "");
  const adminRememberCookie = r.setCookie?.split(";")[0];

  // كلمة مرور غلط — رسالة عربية
  r = await req("POST", "/dashboard/login", { body: { email: "admin@ecocycle.com", password: "wrong" } });
  check("رفض كلمة مرور غلط 400", r.status === 400);
  check("رسالة الرفض بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""), r.json?.msg);

  // دخول ops
  r = await req("POST", "/dashboard/login", { body: { email: "ops@ecocycle.com", password: "ops123456" } });
  check("دخول مدير العمليات ناجح", r.status === 200 && r.json?.admin?.role === "operationsManager");
  const opsToken = r.json?.token;

  /* ═══ 2) المصادقة — المستخدمين ═══ */
  console.log("\n【2】 مصادقة المستخدمين:");

  r = await req("POST", "/auth/login", { body: { email: "user1@ecocycle.com", password: "user123456", remember: true } });
  check("دخول مستخدم بتذكرني ناجح", r.status === 200 && r.json?.token);
  check("كوكيز مستخدم دائم 30 يوم", r.setCookie && /Max-Age=2592000/i.test(r.setCookie));
  const userToken = r.json?.token;
  const userCookie = r.setCookie?.split(";")[0];

  // تسجيل حساب جديد — برسالة عربية (بيانات فريدة لكل تشغيل)
  const runStamp = Date.now();
  const smokeEmail = `smoke-${runStamp}@ecocycle.com`;
  const smokePhone = `010${String(runStamp).slice(-8)}`;
  r = await req("POST", "/auth/register", { body: { username: "مستخدم تجريبي", email: smokeEmail, phoneNumber: smokePhone, password: "test123456" } });
  check("تسجيل مستخدم جديد 201", r.status === 201, JSON.stringify(r.json));
  check("رسالة التسجيل بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""));

  // تليفون مكرر — رسالة عربية (نفس تليفون التسجيل الناجح فوق)
  r = await req("POST", "/auth/register", { body: { username: "مكرر", email: `dup-${runStamp}@ecocycle.com`, phoneNumber: smokePhone, password: "test123456" } });
  check("رفض تليفون مكرر 400", r.status === 400);
  check("رسالة التكرار بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""), r.json?.msg);

  // تليفون غير مصري — رسالة Joi معربة
  r = await req("POST", "/auth/register", { body: { username: "تليفون غلط", email: "badphone@ecocycle.com", phoneNumber: "12345", password: "test123456" } });
  check("رفض تليفون غير صالح 400", r.status === 400);
  check("رسالة Joi معربة (لا إنجليزي خام)", r.status === 400 && /[\u0600-\u06FF]/.test(r.json?.msg || "") && !/pattern/i.test(r.json?.msg), r.json?.msg);

  /* ═══ 3) استعادة كلمة المرور ═══ */
  console.log("\n【3】 استعادة كلمة المرور:");

  // بيانات تحقق غلط — رسالة عامة عربية
  r = await req("POST", "/dashboard/forgot-password", { body: { email: "admin@ecocycle.com", verify: "غلط" } });
  check("رفض بيانات تحقق غلط 400", r.status === 400);
  check("رسالة عامة بالعربية", /التحقق/.test(r.json?.msg || ""));
  check("لا يُعاد رمز استعادة", !r.json?.resetToken);

  // استعادة مستخدم (بريد + تليفون)
  r = await req("POST", "/dashboard/forgot-password", { body: { email: "user1@ecocycle.com", verify: "01000000001" } });
  check("استعادة مستخدم: تحقق ناجح + رمز", r.status === 200 && !!r.json?.resetToken);
  const userResetToken = r.json?.resetToken;

  r = await req("POST", "/dashboard/reset-password", { body: { resetToken: userResetToken, newPassword: "newuser123456" } });
  check("تعيين كلمة مرور جديدة 200", r.status === 200);
  check("رسالة النجاح بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""));

  // الدخول بكلمة المرور الجديدة
  r = await req("POST", "/auth/login", { body: { email: "user1@ecocycle.com", password: "newuser123456" } });
  check("دخول المستخدم بكلمة المرور الجديدة", r.status === 200 && r.json?.token);

  // إرجاع كلمة المرور الأصلية للداتا التجريبية
  r = await req("POST", "/dashboard/forgot-password", { body: { email: "user1@ecocycle.com", verify: "01000000001" } });
  r = await req("POST", "/dashboard/reset-password", { body: { resetToken: r.json?.resetToken, newPassword: "user123456" } });
  check("إرجاع كلمة المرور الأصلية للداتا", r.status === 200);

  // رمز استعادة لا يعمل كـ access
  r = await req("POST", "/dashboard/forgot-password", { body: { email: "admin@ecocycle.com", verify: "المدير العام" } });
  const adminResetToken = r.json?.resetToken;
  r = await req("GET", "/dashboard/machines", { token: adminResetToken });
  check("رمز الاستعادة مرفوض كـ access token (401)", r.status === 401);

  // رمز تالف
  r = await req("POST", "/dashboard/reset-password", { body: { resetToken: "faketoken1234567890abcdefXYZ", newPassword: "whatever123" } });
  check("رمز تالف مرفوض 401", r.status === 401);

  /* ═══ 4) RBAC والصفحات ═══ */
  console.log("\n【4】 RBAC والوصول:");

  r = await req("GET", "/dashboard/stats", { token: adminToken });
  check("لوحة الإحصائيات (أدمن) 200", r.status === 200 && r.json?.data);
  check("إحصائيات واقعية (مستخدمين 11+)", (r.json?.data?.users?.total || 0) >= 11, JSON.stringify(r.json?.data?.users));

  r = await req("GET", "/dashboard/stats/monthly", { token: adminToken });
  check("الإحصائيات الشهرية 200", r.status === 200);

  r = await req("GET", "/dashboard/stats/leaderboard", { token: adminToken });
  check("لوحة الصدارة 200", r.status === 200);

  r = await req("GET", "/dashboard/machines", { token: adminToken });
  check("قائمة الماكينات 200 (8 ماكينات)", r.status === 200 && (r.json?.data?.length === 8 || r.json?.data?.machines?.length === 8));

  r = await req("GET", "/dashboard/users", { token: adminToken });
  check("قائمة المستخدمين 200", r.status === 200);

  r = await req("GET", "/dashboard/pricing", { token: adminToken });
  check("التسعير 200", r.status === 200);

  r = await req("GET", "/dashboard/partners", { token: adminToken });
  check("الشركاء 200", r.status === 200);

  r = await req("GET", "/dashboard/notifications", { token: adminToken });
  check("الإشعارات 200", r.status === 200);

  r = await req("GET", "/dashboard/achievements", { token: adminToken });
  check("الإنجازات 200", r.status === 200);

  r = await req("GET", "/dashboard/issues", { token: adminToken });
  check("البلاغات 200", r.status === 200);

  r = await req("GET", "/dashboard/coupons", { token: adminToken });
  check("الكوبونات 200", r.status === 200);

  // audit-logs: superAdmin فقط
  r = await req("GET", "/dashboard/audit-logs", { token: adminToken });
  check("سجل التدقيق (superAdmin) 200", r.status === 200);
  r = await req("GET", "/dashboard/audit-logs", { token: opsToken });
  check("سجل التدقيق مرفوض للـ ops (403)", r.status === 403);
  check("رسالة الرفض بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""), r.json?.msg);

  // بدون توكن
  r = await req("GET", "/dashboard/users");
  check("بدون توكن مرفوض 401", r.status === 401);
  check("رسالة الرفض بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""), r.json?.msg);

  /* ═══ 5) تجديد الجلسة ═══ */
  console.log("\n【5】 تجديد الجلسة:");

  r = await req("POST", "/dashboard/refresh", { cookie: adminRememberCookie });
  check("تجديد توكن الأدمن من كوكيز التذكرني", r.status === 200 && r.json?.token);
  check("التدوير يحافظ على 30 يومًا", r.setCookie && /Max-Age=2592000/i.test(r.setCookie));

  r = await req("POST", "/dashboard/refresh");
  check("تجديد بدون كوكيز مرفوض 401", r.status === 401);

  r = await req("POST", "/auth/refresh", { cookie: userCookie });
  check("تجديد توكن المستخدم", r.status === 200 && r.json?.token);

  /* ═══ 6) مسار PWA العام ═══ */
  console.log("\n【6】 مسار PWA (الإيداع العام):");

  r = await req("GET", "/transactions/materials");
  check("أسعار المواد عامة 200", r.status === 200 && Array.isArray(r.json?.data));

  r = await req("GET", "/transactions/qr-info?qrToken=invalid");
  check("رمز QR غير صالح — رد نظيف", r.status === 200 || r.status === 404, `status=${r.status}`);

  /* ═══ 7) 404 + أخطاء عامة ═══ */
  console.log("\n【7】 الحالات العامة:");

  r = await req("GET", "/nonexistent-path");
  check("مسار غير موجود 404", r.status === 404);
  check("رسالة 404 بالعربية", /[\u0600-\u06FF]/.test(r.json?.msg || ""), r.json?.msg);

  /* ═══ النتيجة ═══ */
  console.log("\n══════════════════════════════════════");
  results.forEach((line) => console.log(line));
  console.log("══════════════════════════════════════");
  console.log(`✅ نجح: ${passed}  ❌ فشل: ${failed}`);
  console.log("══════════════════════════════════════\n");
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => {
  console.error("خطأ في تشغيل الاختبارات:", e);
  process.exit(1);
});
