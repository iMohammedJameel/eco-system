/* ═══════════════════════════════════════════════════════════════
   i18n patch — namespace: audit (سجل النظام)
   محتوى namespace `audit` كاملًا (عربي/إنجليزي) — يُدمج لاحقًا
   في src/i18n/translations.js تحت المفتاح audit.
   ⛔ لا تعدّل translations.js يدويًا.
   ═══════════════════════════════════════════════════════════════ */

export const arAudit = {
  /* ── الصفحة ── */
  title: 'سجل النظام',
  subtitle: 'سجل تدقيق كامل لكل عمليات الإدارة — ميناء عمل إيه وإمتى',
  emptyTitle: 'السجل فارغ',
  emptyMsg: 'ستظهر هنا كل العمليات الإدارية تلقائيًا',

  /* ── فلاتر النوع ── */
  catAuth: 'الدخول',
  catUser: 'المستخدمين',
  catMachine: 'الماكينات',
  catPricing: 'التسعير',
  catPartner: 'الشركاء',
  catCoupon: 'الكوبونات',
  catIssue: 'البلاغات',
  catSystem: 'النظام',

  /* ── أنواع الأحداث ── */
  actLogin: 'تسجيل دخول',
  actLogout: 'تسجيل خروج',
  actUserCreate: 'إنشاء مستخدم',
  actUserUpdate: 'تعديل مستخدم',
  actUserDelete: 'حذف مستخدم',
  actMachineCreate: 'إضافة ماكينة',
  actMachineUpdate: 'تعديل ماكينة',
  actMachineDelete: 'حذف ماكينة',
  actPricingCreate: 'إضافة تسعيرة',
  actPricingUpdate: 'تعديل تسعيرة',
  actPricingDelete: 'حذف تسعيرة',
  actPartnerCreate: 'إضافة شريك',
  actPartnerUpdate: 'تعديل شريك',
  actPartnerDelete: 'حذف شريك',
  actCouponIssue: 'إصدار كوبون',
  actCouponRedeem: 'استبدال كوبون',
  actCouponCancel: 'إلغاء كوبون',
  actIssueUpdate: 'تحديث بلاغ',
  actReportExport: 'تصدير تقرير',
};

export const enAudit = {
  /* ── page ── */
  title: 'Audit Logs',
  subtitle: 'A complete audit trail of every admin operation — who did what and when',
  emptyTitle: 'No logs yet',
  emptyMsg: 'All administrative operations will appear here automatically',

  /* ── target filters ── */
  catAuth: 'Sign-in',
  catUser: 'Users',
  catMachine: 'Machines',
  catPricing: 'Pricing',
  catPartner: 'Partners',
  catCoupon: 'Coupons',
  catIssue: 'Issue Reports',
  catSystem: 'System',

  /* ── event types ── */
  actLogin: 'Sign in',
  actLogout: 'Sign out',
  actUserCreate: 'Create user',
  actUserUpdate: 'Update user',
  actUserDelete: 'Delete user',
  actMachineCreate: 'Add machine',
  actMachineUpdate: 'Update machine',
  actMachineDelete: 'Delete machine',
  actPricingCreate: 'Add pricing',
  actPricingUpdate: 'Update pricing',
  actPricingDelete: 'Delete pricing',
  actPartnerCreate: 'Add partner',
  actPartnerUpdate: 'Update partner',
  actPartnerDelete: 'Delete partner',
  actCouponIssue: 'Issue coupon',
  actCouponRedeem: 'Redeem coupon',
  actCouponCancel: 'Cancel coupon',
  actIssueUpdate: 'Update issue report',
  actReportExport: 'Export report',
};
