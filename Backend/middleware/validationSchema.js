const { FAIL } = require("../utils/httpStatusText");

/* ═══════════════════════════════════════════════════════════════════
   مترجم رسائل Joi للعربية — نقطة مركزية واحدة تغطي كل سكيماات المشروع.
   الـ QA لاحظ أن أخطاء التحقق بتوصل المستخدم بالإنجليزي الخام
   (مثل "lat must be less than or equal to 90") في واجهة عربية بالكامل.
   الحل: خريطة أسماء حقول + خريطة قواعد → رسائل عربية واضحة.
   أي رسالة بتكرر زي ما هي (سكيما مخصصة) بتفضل — مع استثناء
   الرسائل الإنجليزية المعروفة اللي بتتترجم هنا.
   ═══════════════════════════════════════════════════════════════════ */

// أسماء الحقول المستخدمة في كل سكيماات المشروع
const FIELD_AR = {
  username: "اسم المستخدم",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  newPassword: "كلمة المرور الجديدة",
  currentPassword: "كلمة المرور الحالية",
  phoneNumber: "رقم الهاتف",
  remember: "خيار تذكرني",
  verify: "بيانات التحقق",
  resetToken: "رمز الاستعادة",
  name: "الاسم",
  location: "الموقع",
  governorate: "المحافظة",
  coordinates: "الإحداثيات",
  lat: "خط العرض",
  lng: "خط الطول",
  status: "الحالة",
  fillPercentage: "نسبة الامتلاء",
  materialType: "نوع المادة",
  weightKg: "الوزن بالكيلوجرام",
  itemsCount: "عدد القطع",
  amount: "المبلغ",
  withdrawalMethod: "طريقة السحب",
  accountNumber: "رقم الحساب",
  qrToken: "رمز QR",
  machineId: "المعرّف",
  pricePerKg: "السعر لكل كيلوجرام",
  currency: "العملة",
  isActive: "حالة التفعيل",
  category: "التصنيف",
  contactEmail: "بريد التواصل",
  contactPhone: "هاتف التواصل",
  website: "الموقع الإلكتروني",
  address: "العنوان",
  title: "العنوان",
  description: "الوصف",
  type: "النوع",
  priority: "الأولوية",
  adminNotes: "ملاحظات الإدارة",
  discountType: "نوع الخصم",
  discountValue: "قيمة الخصم",
  minSpend: "الحد الأدنى للشراء",
  validUntil: "تاريخ الانتهاء",
  code: "الكود",
  pointsCost: "تكلفة النقاط",
  icon: "الأيقونة",
  metric: "المقياس",
  threshold: "الحد المطلوب",
  xpReward: "مكافأة الخبرة",
  badgeColor: "لون الشارة",
  message: "نص الرسالة",
  recipient: "المستلم",
  role: "الدور",
  userId: "المستخدم",
  partnerId: "الشريك",
  offer: "العرض",
  discountOffers: "عروض الخصم",
  page: "رقم الصفحة",
  limit: "عدد العناصر",
};

// قوالب القواعد — ${f} = اسم الحقل، ${limit} = القيمة الحدية
const RULE_AR = {
  "any.required": "${f} مطلوب",
  "string.empty": "${f} مطلوب",
  "string.base": "${f} يجب أن يكون نصًا",
  "string.min": "${f} يجب ألا يقل عن ${limit} حروف",
  "string.max": "${f} يجب ألا يزيد عن ${limit} حروف",
  "string.length": "${f} يجب أن يكون ${limit} حروف بالضبط",
  "string.email": "صيغة البريد الإلكتروني غير صحيحة",
  "string.pattern.base": "صيغة ${f} غير صحيحة",
  "string.alphanum": "${f} يجب أن يحتوي حروفًا وأرقامًا إنجليزية فقط",
  "string.uri": "${f} يجب أن يكون رابطًا صالحًا",
  "number.base": "${f} يجب أن يكون رقمًا",
  "number.min": "${f} يجب ألا يقل عن ${limit}",
  "number.max": "${f} يجب ألا يزيد عن ${limit}",
  "number.positive": "${f} يجب أن يكون رقمًا أكبر من صفر",
  "number.integer": "${f} يجب أن يكون رقمًا صحيحًا بدون كسور",
  "number.precision": "${f} يجب ألا يزيد عن خانتين عشريتين",
  "boolean.base": "${f} يجب أن يكون قيمة صح/خطأ",
  "date.base": "${f} يجب أن يكون تاريخًا صالحًا",
  "date.greater": "${f} يجب أن يكون تاريخًا لاحقًا للبدء",
  "date.less": "${f} يجب أن يكون تاريخًا سابقًا",
  "array.base": "${f} يجب أن يكون قائمة",
  "array.min": "${f} يجب أن يحتوي على ${limit} عناصر على الأقل",
  "array.max": "${f} يجب ألا يزيد عن ${limit} عناصر",
  "any.only": "${f} يحتوي على قيمة غير مسموح بها",
  "any.invalid": "${f} يحتوي على قيمة غير مسموح بها",
  "any.unknown": "حقل غير مسموح: ${f}",
  "alternatives.any": "قيمة ${f} غير صالحة",
  "object.base": "${f} يجب أن يكون كائن بيانات",
};

// رسائل إنجليزية مخصصة في السكيماات → مقابلها العربي
const CUSTOM_EN_AR = {
  "Invalid Egyptian phone number": "رقم الهاتف يجب أن يكون رقمًا مصريًا صحيحًا (11 رقمًا يبدأ بـ 01)",
};

const hasArabic = (s) => /[\u0600-\u06FF]/.test(String(s));

// ترجمة تفصيل خطأ واحد
function translateDetail(detail) {
  const raw = detail?.message || "";
  if (hasArabic(raw)) return raw; // رسالة عربية بالفعل — تُترك
  if (CUSTOM_EN_AR[raw]) return CUSTOM_EN_AR[raw];

  const fieldPath = (detail?.path || [])
    .map((seg) => FIELD_AR[seg] ?? String(seg))
    .join(" — ");
  const f = fieldPath || "هذا الحقل";
  const template = RULE_AR[detail?.type];
  if (!template) return `قيمة غير صالحة في ${f}`;

  return template.replace("${f}", f).replace("${limit}", detail?.context?.limit ?? "");
}

module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const msg = error.details.map(translateDetail).filter(Boolean).join("، ");
    return res.status(400).json({
      status: FAIL,
      msg: msg || "البيانات المُرسلة غير صالحة",
    });
  }
  next();
};
