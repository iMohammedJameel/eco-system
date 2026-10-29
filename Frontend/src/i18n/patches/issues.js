/* ═══════════════════════════════════════════════════════════════
   i18n patch — namespace: issues (بلاغات الأعطال)
   محتوى namespace `issues` كاملًا (عربي/إنجليزي) — يُدمج لاحقًا
   في src/i18n/translations.js تحت المفتاح issues.
   ⛔ لا تعدّل translations.js يدويًا.
   ═══════════════════════════════════════════════════════════════ */

export const arIssues = {
  /* ── الصفحة ── */
  title: 'بلاغات أعطال الماكينات',
  subtitle: 'إجمالي {total} بلاغ — {open} مفتوح، {high} بأولوية عالية',
  updated: 'تم تحديث البلاغ',
  updateFailed: 'فشل التحديث',
  statusUpdatedTo: 'تم تحديث الحالة إلى: {status}',
  deleted: 'تم حذف البلاغ',
  deleteFailed: 'فشل الحذف',
  deleteTitle: 'حذف البلاغ',
  deleteMsg: 'هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء.',
  emptyTitle: 'لا توجد بلاغات',
  emptyMsg: 'لا توجد بلاغات مطابقة للفلاتر الحالية',
  help: 'مساعدة',
  helpTitle: 'دليل إدارة بلاغات الأعطال',
  helpBody: 'البلاغات بتيجي من المستخدمين لما ماكينة تتعطل أو تمتلئ. رتب حسب الأولوية وعالج العاجل الأول، وحدّث حالة البلاغ (جاري/اتحل) مع ملاحظات الإدارة عشان المستخدم يتابع تطور البلاغ.',

  /* ── بطاقات الإحصائيات ── */
  statsOpen: 'مفتوح',
  statsInProgress: 'قيد المعالجة',
  statsResolved: 'تم الحل',
  statsDismissed: 'مُستبعد',
  statsHighOpen: 'أولوية عالية مفتوحة',

  /* ── الفلاتر ── */
  allStatuses: 'جميع الحالات',
  allTypes: 'جميع الأنواع',
  allPriorities: 'جميع الأولويات',

  /* ── أنواع البلاغ ── */
  typeBroken: 'ماكينة معطلة',
  typeFull: 'ماكينة ممتلئة',
  typeJammed: 'ماكينة عالقة',
  typeDirty: 'ماكينة متسخة',
  typeRejectedItem: 'رفض مادة صالحة',
  typeOther: 'أخرى',

  /* ── حالات البلاغ ── */
  statusOpen: 'مفتوح',
  statusInProgress: 'قيد المعالجة',
  statusResolved: 'تم الحل',
  statusDismissed: 'مُستبعد',

  /* ── الأولويات ── */
  priorityLow: 'منخفضة',
  priorityMedium: 'متوسطة',
  priorityHigh: 'عالية',

  /* ── كارت البلاغ ── */
  adminNotesLabel: 'ملاحظات الإدارة:',
  resolvedBy: 'تم الحل بواسطة: {user} • {time}',
  actionStart: 'بدء المعالجة',
  actionResolve: '✓ تم الحل',
  actionDismiss: 'استبعاد',
  actionDetails: 'تفاصيل/تعديل',

  /* ── نافذة التفاصيل/التعديل ── */
  editTitle: 'تعديل البلاغ',
  infoType: 'النوع:',
  infoMachine: 'الماكينة:',
  infoUser: 'المستخدم:',
  infoDate: 'تاريخ البلاغ:',
  infoDescription: 'الوصف:',
  fStatus: 'الحالة',
  fPriority: 'الأولوية',
  fAdminNotes: 'ملاحظات الإدارة',
  fAdminNotesPh: 'اكتب ملاحظات حول الإجراء المتخذ...',
  saveEdit: 'حفظ التعديلات',
};

export const enIssues = {
  /* ── page ── */
  title: 'Machine Issue Reports',
  subtitle: '{total} reports total — {open} open, {high} high priority',
  updated: 'Issue report updated',
  updateFailed: 'Update failed',
  statusUpdatedTo: 'Status updated to: {status}',
  deleted: 'Issue report deleted',
  deleteFailed: 'Delete failed',
  deleteTitle: 'Delete Issue Report',
  deleteMsg: 'Are you sure you want to delete this issue report? This action cannot be undone.',
  emptyTitle: 'No issue reports',
  emptyMsg: 'No issue reports match the current filters',
  help: 'Help',
  helpTitle: 'Issue reports guide',
  helpBody: 'Reports come from users when a machine breaks down or fills up. Sort by priority to handle urgent ones first, and update the status (in progress/resolved) with admin notes so the user can follow the progress.',

  /* ── stat cards ── */
  statsOpen: 'Open',
  statsInProgress: 'In Progress',
  statsResolved: 'Resolved',
  statsDismissed: 'Dismissed',
  statsHighOpen: 'Open High Priority',

  /* ── filters ── */
  allStatuses: 'All statuses',
  allTypes: 'All types',
  allPriorities: 'All priorities',

  /* ── issue types ── */
  typeBroken: 'Broken Machine',
  typeFull: 'Full Machine',
  typeJammed: 'Jammed Machine',
  typeDirty: 'Dirty Machine',
  typeRejectedItem: 'Valid Material Rejected',
  typeOther: 'Other',

  /* ── issue statuses ── */
  statusOpen: 'Open',
  statusInProgress: 'In Progress',
  statusResolved: 'Resolved',
  statusDismissed: 'Dismissed',

  /* ── priorities ── */
  priorityLow: 'Low',
  priorityMedium: 'Medium',
  priorityHigh: 'High',

  /* ── issue card ── */
  adminNotesLabel: 'Admin notes:',
  resolvedBy: 'Resolved by: {user} • {time}',
  actionStart: 'Start Processing',
  actionResolve: '✓ Mark Resolved',
  actionDismiss: 'Dismiss',
  actionDetails: 'Details / Edit',

  /* ── details / edit modal ── */
  editTitle: 'Edit Issue Report',
  infoType: 'Type:',
  infoMachine: 'Machine:',
  infoUser: 'User:',
  infoDate: 'Report Date:',
  infoDescription: 'Description:',
  fStatus: 'Status',
  fPriority: 'Priority',
  fAdminNotes: 'Admin Notes',
  fAdminNotesPh: 'Write notes about the action taken...',
  saveEdit: 'Save Changes',
};
