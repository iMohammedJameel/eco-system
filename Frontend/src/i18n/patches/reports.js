/* ═══════════════════════════════════════════════════════════════
   باتش ترجمة صفحة التقارير المالية — namespace: reports
   يُدمج لاحقًا في src/i18n/translations.js تحت المفتاح reports
   الوحدات (ج.م/كجم) تمرّ كـ {unit} من dashboard.egp / dashboard.kg
   ═══════════════════════════════════════════════════════════════ */

export const arReports = {
  /* ── رأس الصفحة وأزرار التصدير ── */
  title: 'التقارير المالية',
  subtitle: 'نظرة شاملة على الأداء المالي للنظام',
  exportPdf: 'تصدير PDF',
  exportTransactions: 'تصدير المعاملات Excel',
  exportMonthly: 'تصدير الشهور Excel',
  exportMaterials: 'تصدير الخامات Excel',
  exporting: 'جارٍ التصدير...',
  exportedTransactions: 'تم تنزيل تقرير المعاملات — Excel',
  exportedMonthly: 'تم تنزيل تقرير الإيرادات الشهرية — Excel',
  exportedMaterials: 'تم تنزيل تقرير الخامات — Excel',
  exportFailed: 'فشل تصدير التقرير',

  /* ── مستند الطباعة (PDF عبر المتصفح) ── */
  printDocTitle: 'التقرير المالي',
  printH1: 'الإيرادات الشهرية — آخر 12 شهرًا',
  printMeta: 'تم الإنشاء {date} · إجمالي الإيرادات {revenue} · إجمالي الوزن {weight}',
  printHint: 'استخدم Ctrl+P ثم «حفظ كـ PDF» لحفظ التقرير',
  printNoData: 'لا توجد بيانات',
  thMonth: 'الشهر',
  thTxCount: 'عدد المعاملات',
  thWeight: 'الوزن ({unit})',
  thRevenue: 'الإيرادات ({unit})',

  /* ── بطاقات الإحصائيات ── */
  statRevenue: 'إجمالي الإيرادات ({unit})',
  statWithdrawals: 'إجمالي السحوبات ({unit})',
  statNetRevenue: 'صافي الإيرادات ({unit})',
  statTransactions: 'إجمالي المعاملات',

  /* ── رسم الأعمدة (الإيرادات والوزن) ── */
  chartTitle: 'الإيرادات والوزن المُعاد تدويره شهرياً',
  lastMonths: 'آخر {n} شهر',
  lastMonthsPl: 'آخر {n} أشهر',
  seriesRevenue: 'إيرادات',
  seriesWeight: 'وزن',
  noData: 'لا توجد بيانات كافية',

  /* ── الدونات (توزيع المواد) ── */
  donutTitle: 'توزيع المواد المُعاد تدويرها',

  /* ── جدول التفاصيل الشهرية ── */
  monthlyTitle: 'التفاصيل الشهرية',
  noMonthlyData: 'لا توجد بيانات شهرية',
  thCategory: 'الفئة',
  rowRevenue: 'الإيرادات ({unit})',
  rowWeight: 'الوزن المعاد ({unit})',
  rowOperations: 'عدد العمليات',
};

export const enReports = {
  /* ── Page header & export buttons ── */
  title: 'Financial Reports',
  subtitle: 'A comprehensive view of the system\'s financial performance',
  exportPdf: 'Export PDF',
  exportTransactions: 'Export Transactions — Excel',
  exportMonthly: 'Export Monthly — Excel',
  exportMaterials: 'Export Materials — Excel',
  exporting: 'Exporting...',
  exportedTransactions: 'Transactions report downloaded — Excel',
  exportedMonthly: 'Monthly revenue report downloaded — Excel',
  exportedMaterials: 'Materials report downloaded — Excel',
  exportFailed: 'Failed to export the report',

  /* ── Print document (browser PDF) ── */
  printDocTitle: 'Financial Report',
  printH1: 'Monthly Revenue — Last 12 Months',
  printMeta: 'Generated {date} · Total revenue {revenue} · Total weight {weight}',
  printHint: 'Press Ctrl+P then "Save as PDF" to save the report',
  printNoData: 'No data',
  thMonth: 'Month',
  thTxCount: 'Transactions',
  thWeight: 'Weight ({unit})',
  thRevenue: 'Revenue ({unit})',

  /* ── Stats cards ── */
  statRevenue: 'Total Revenue ({unit})',
  statWithdrawals: 'Total Withdrawals ({unit})',
  statNetRevenue: 'Net Revenue ({unit})',
  statTransactions: 'Total Transactions',

  /* ── Bar chart (revenue & weight) ── */
  chartTitle: 'Monthly Revenue & Recycled Weight',
  lastMonths: 'Last {n} months',
  lastMonthsPl: 'Last {n} months',
  seriesRevenue: 'Revenue',
  seriesWeight: 'Weight',
  noData: 'Not enough data yet',

  /* ── Donut (material distribution) ── */
  donutTitle: 'Recycled Materials Distribution',

  /* ── Monthly details table ── */
  monthlyTitle: 'Monthly Details',
  noMonthlyData: 'No monthly data',
  thCategory: 'Metric',
  rowRevenue: 'Revenue ({unit})',
  rowWeight: 'Recycled Weight ({unit})',
  rowOperations: 'Transactions',
};
