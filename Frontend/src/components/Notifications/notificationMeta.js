/** ثوابت عرض الإشعارات — مشتركة بين الصفحة والكارت والنموذج (التسميات عبر labelKey وتُترجم في مواقع الاستخدام) */

export const TYPE_OPTIONS = [
  { value: 'system',        labelKey: 'notifications.typeSystem',        icon: '⚙',  color: '#0d6c3d' },
  { value: 'earnings',      labelKey: 'notifications.typeEarnings',      icon: '$',  color: '#0d6c3d' },
  { value: 'machine_alert', labelKey: 'notifications.typeMachineAlert', icon: '⚠',  color: '#a06a10' },
  { value: 'promo',         labelKey: 'notifications.typePromo',         icon: '🎯', color: '#9c27b0' },
  { value: 'issue',         labelKey: 'notifications.typeIssue',         icon: '🔧', color: '#b3261e' },
];

export const TYPE_LABEL_KEYS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.labelKey]));
export const TYPE_ICONS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.icon]));
export const TYPE_COLORS = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.color]));

export const EMPTY_FORM = {
  title: '',
  message: '',
  type: 'system',
  recipient: 'all',
};
