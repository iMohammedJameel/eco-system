/**
 * ثوابت بلاغات الأعطال — المصدر الوحيد للأنواع والحالات والأولويات
 * ومفاتيح الترجمة والأيقونات والألوان (كانت مكررة داخل الصفحة).
 * التسميات تُعرض عبر i18n: labelKey يُمرَّر لـ t() في مكان الاستخدام.
 */

export const TYPE_OPTIONS = [
  { value: 'broken', labelKey: 'issues.typeBroken', icon: '🔧', color: '#b3261e' },
  { value: 'full', labelKey: 'issues.typeFull', icon: '📦', color: '#a06a10' },
  { value: 'jammed', labelKey: 'issues.typeJammed', icon: '⚡', color: '#9c27b0' },
  { value: 'dirty', labelKey: 'issues.typeDirty', icon: '🧹', color: '#0d6c3d' },
  { value: 'rejected_item', labelKey: 'issues.typeRejectedItem', icon: '✖', color: '#ff5722' },
  { value: 'other', labelKey: 'issues.typeOther', icon: '•', color: '#607d8b' },
];

export const STATUS_OPTIONS = [
  { value: 'open', labelKey: 'issues.statusOpen', className: 'statusOpen', color: '#b3261e' },
  { value: 'in_progress', labelKey: 'issues.statusInProgress', className: 'statusProgress', color: '#a06a10' },
  { value: 'resolved', labelKey: 'issues.statusResolved', className: 'statusResolved', color: '#0d6c3d' },
  { value: 'dismissed', labelKey: 'issues.statusDismissed', className: 'statusDismissed', color: '#9e9e9e' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', labelKey: 'issues.priorityLow', className: 'priorityLow' },
  { value: 'medium', labelKey: 'issues.priorityMedium', className: 'priorityMedium' },
  { value: 'high', labelKey: 'issues.priorityHigh', className: 'priorityHigh' },
];

export const TYPE_LABEL_KEYS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.labelKey]));
export const TYPE_ICONS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.icon]));
export const TYPE_COLORS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.color]));
export const STATUS_LABEL_KEYS = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.labelKey]));

export function formatDateTime(iso, lang = 'ar') {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
