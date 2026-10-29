/* ═══════════════════════════════════════════════════════════════
   باتش ترجمة لوحة العمليات — namespace: ops
   يُدمج لاحقًا في src/i18n/translations.js تحت المفتاح ops
   أنواع البلاغات والأولويات كمفاتيح labelKeys في opsMeta.js
   ═══════════════════════════════════════════════════════════════ */

export const arOps = {
  /* ── رأس الصفحة ── */
  title: 'لوحة العمليات',
  subtitle: 'مراقبة العمليات اليومية',
  subtitleFull: 'المهام ومؤشرات الأداء ومراقبة الأعطال — مع تحليل تنبؤي',

  /* ── مؤشرات الأداء (KPI) ── */
  kpiActiveUsers: 'مستخدم نشط',
  kpiNearlyFull: 'ماكينة شبه ممتلئة',
  kpiOpenIssues: 'بلاغ مفتوح',
  kpiActivePartners: 'شريك نشط',

  /* ── ملخص حالات البلاغات ── */
  stOpen: 'مفتوح',
  stInProgress: 'قيد المعالجة',
  stResolved: 'تم حله',
  stDismissed: 'مرفوض',
  stHighPriority: 'عالية الأولوية',

  /* ── لوحة الماكينات التي تحتاج تفريغ ── */
  machinesTitle: 'ماكينات تحتاج تفريغ',
  machinesEmpty: 'كل الماكينات تعمل بكفاءة طبيعية.',

  /* ── لوحة أحدث البلاغات ── */
  issuesTitle: 'أحدث البلاغات المفتوحة',
  issuesEmpty: 'لا توجد بلاغات مفتوحة — كل حاجة تمام!',
  unknownMachine: 'ماكينة غير معروفة',
  priorityWith: 'أولوية {p}',

  /* ── أنواع البلاغات (opsMeta) ── */
  issueBroken: 'معطلة',
  issueFull: 'ممتلئة',
  issueJammed: 'عالقة',
  issueDirty: 'تحتاج تنظيف',
  issueRejectedItem: 'رفضت خامات',
  issueFraud: 'نشاط مشبوه',
  issueOther: 'أخرى',

  /* ── الأولويات (opsMeta) ── */
  priorityHigh: 'عالية',
  priorityMedium: 'متوسطة',
  priorityLow: 'منخفضة',

  /* ── لوحة تنبؤ الامتلاء ── */
  forecastTitle: 'تنبؤ الامتلاء — إجراء استباقي',
  urgentBadge: '{n} عاجل',
  forecastEmpty: 'لا توجد تنبؤات قريبة — معدلات الامتلاء منخفضة.',
  avgPerDay: 'متوسط {n} {kg}/يوم',
  noForecast: 'غير متوقع',
  withinHours: 'خلال {n} ساعة',
  withinDays: 'خلال {n} يوم',

  /* ── لوحة كشف الاحتيال ── */
  fraudTitle: 'كشف الاحتيال — معاملات مشتبهة',
  fraudEmpty: 'لا توجد معاملات مشتبهة — النظام آمن.',
  userFallback: 'مستخدم',
  egpAmount: '{n} {unit}',
};

export const enOps = {
  /* ── Page header ── */
  title: 'Operations Dashboard',
  subtitle: 'Daily operations monitoring',
  subtitleFull: 'Tasks, KPIs and fault monitoring — with predictive analysis',

  /* ── KPI row ── */
  kpiActiveUsers: 'Active users',
  kpiNearlyFull: 'Nearly full machines',
  kpiOpenIssues: 'Open issues',
  kpiActivePartners: 'Active partners',

  /* ── Issue status summary ── */
  stOpen: 'Open',
  stInProgress: 'In progress',
  stResolved: 'Resolved',
  stDismissed: 'Dismissed',
  stHighPriority: 'High priority',

  /* ── Machines needing emptying panel ── */
  machinesTitle: 'Machines Needing Emptying',
  machinesEmpty: 'All machines are running normally.',

  /* ── Latest open issues panel ── */
  issuesTitle: 'Latest Open Issues',
  issuesEmpty: 'No open issues — all clear!',
  unknownMachine: 'Unknown machine',
  priorityWith: 'Priority: {p}',

  /* ── Issue types (opsMeta) ── */
  issueBroken: 'Broken',
  issueFull: 'Full',
  issueJammed: 'Jammed',
  issueDirty: 'Needs cleaning',
  issueRejectedItem: 'Rejected items',
  issueFraud: 'Suspicious activity',
  issueOther: 'Other',

  /* ── Priorities (opsMeta) ── */
  priorityHigh: 'High',
  priorityMedium: 'Medium',
  priorityLow: 'Low',

  /* ── Fill forecast panel ── */
  forecastTitle: 'Fill Forecast — Proactive Action',
  urgentBadge: '{n} urgent',
  forecastEmpty: 'No imminent forecasts — fill rates are low.',
  avgPerDay: 'Avg. {n} {kg}/day',
  noForecast: 'Not forecast',
  withinHours: 'Within {n} hours',
  withinDays: 'Within {n} days',

  /* ── Fraud detection panel ── */
  fraudTitle: 'Fraud Detection — Suspicious Transactions',
  fraudEmpty: 'No suspicious transactions — the system is secure.',
  userFallback: 'User',
  egpAmount: '{n} {unit}',
};
