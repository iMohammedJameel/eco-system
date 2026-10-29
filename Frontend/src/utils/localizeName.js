/**
 * localizeName — اسم عرض متناسق مع لغة الواجهة.
 *
 * المشكلة: الأدمن المتخزن في الداتابيز اسمه بحروف عربية («المدير العام»)،
 * فلما الواجهة تبقى إنجليزية بتظهر التحية «Good evening المدير العام» —
 * خليط عربي/إنجليزي متنافر. والعكس لو الاسم لاتيني والواجهة عربية.
 *
 * الحل: لو اتجاه كتابة الاسم لا يطابق اتجاه الواجهة، نعرض **لقب الدور المترجم**
 * (نفس نظام navbar.role*) بدل الاسم الخام — وده نمط شائع في البانلات الإدارية
 * (تحية قائمة على الدور زي «Welcome, Administrator» / «مرحباً أيها المدير»).
 * لو الاسم والواجهة في نفس الاتجاه، أو مفيش لقب دور معروف، بنرجّع الاسم زي ما هو.
 */

/** حروف عبرية/عربية (بما فيها امتداداتها) — للكشف عن النصوص RTL */
const RTL_CHARS = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;

const ROLE_KEYS = {
  superAdmin: 'navbar.roleSuperAdmin',
  operationsManager: 'navbar.roleOperations',
  supervisor: 'navbar.roleSupervisor',
  user: 'navbar.roleCitizen',
  partner: 'navbar.rolePartner',
};

/**
 * @param {string|null} name   الاسم الخام من الداتا (username/name)
 * @param {string|null} role   دور المستخدم (superAdmin | operationsManager | supervisor | user | partner)
 * @param {string}      lang   لغة الواجهة الحالية ('ar' | 'en')
 * @param {(key: string) => string} t دالة الترجمة من useLanguage
 * @returns {string} الاسم الصالح للعرض بلغة الواجهة
 */
export function localizeName(name, role, lang, t) {
  if (!name) return role ? t(ROLE_KEYS[role]) || '' : '';

  const nameIsRTL = RTL_CHARS.test(name);
  const uiIsRTL = lang === 'ar';

  // الاسم والواجهة في نفس الاتجاه — نعرضه زي ما هو
  if (nameIsRTL === uiIsRTL) return name;

  // اتجاه مختلف — لقب الدور المترجم لو متاح، وإلا الاسم الخام
  const roleKey = role && ROLE_KEYS[role];
  if (roleKey) {
    const label = t(roleKey);
    if (label && label !== roleKey) return label;
  }
  return name;
}
