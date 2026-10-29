/** ثوابت ومُنسّقات لوحة العمليات — النصوص عبر مفاتيح i18n (namespace: ops) */

/* مفاتيح تسميات أنواع البلاغات — تُمرَّر لـ t() في موقع الاستخدام */
export const ISSUE_TYPE_LABEL_KEYS = {
  broken: 'ops.issueBroken',
  full: 'ops.issueFull',
  jammed: 'ops.issueJammed',
  dirty: 'ops.issueDirty',
  rejected_item: 'ops.issueRejectedItem',
  fraud: 'ops.issueFraud',
  other: 'ops.issueOther',
};

/* مفاتيح تسميات الأولويات */
export const PRIORITY_LABEL_KEYS = {
  high: 'ops.priorityHigh',
  medium: 'ops.priorityMedium',
  low: 'ops.priorityLow',
};

/** الساعات حتى الامتلاء → نص — يستقبل مُترجم t من موقع الاستخدام */
export function formatHours(h, t) {
  if (h == null) return t('ops.noForecast');
  if (h < 24) return t('ops.withinHours', { n: h });
  return t('ops.withinDays', { n: Math.round(h / 24) });
}

/** «منذ X» للبلاغات والمعاملات — يستقبل مُترجم t من موقع الاستخدام */
export function formatRelative(iso, t) {
  if (!iso) return '';
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return t('dashboard.justNow');
  if (min < 60) return t('dashboard.minutesAgo', { n: min });
  return t('dashboard.hoursAgo', { n: Math.floor(min / 60) });
}
