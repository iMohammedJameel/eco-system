/**
 * ثوابت فئات الشركاء — المصدر الوحيد للحقيقة (Single Source of Truth).
 * كانت مكررة 3 مرات بثلاث نسخ مختلفة (عربي/إنجليزي) في:
 *   pages/Partners/Partners.jsx + pages/PartnerPortal/PartnerPortal.jsx + pages/Coupons/Coupons.jsx
 * أي تعديل مستقبلي على الفئات يحدث هنا مرة واحدة.
 */

export const CATEGORY_OPTIONS = [
  { value: 'supermarket', label: 'سوبر ماركت', en: 'Supermarket', icon: '🛒' },
  { value: 'electronics', label: 'إلكترونيات', en: 'Electronics', icon: '📱' },
  { value: 'pharmacy', label: 'صيدلية', en: 'Pharmacy', icon: '💊' },
  { value: 'fashion', label: 'أزياء', en: 'Fashion', icon: '👕' },
  { value: 'food', label: 'طعام ومشروبات', en: 'Food & Beverage', icon: '🍔' },
  { value: 'services', label: 'خدمات', en: 'Services', icon: '🤝' },
  { value: 'other', label: 'أخرى', en: 'Other', icon: '🏪' },
];

/** خريطة value → label عربي */
export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

/** خريطة value → label إنجليزي (كانت مستخدمة في PartnerPortal) */
export const CATEGORY_LABELS_EN = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.en]),
);

/** خريطة value → أيقونة إيموجي */
export const CATEGORY_ICONS = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.icon]),
);

/** حالة العرض الافتراضية */
export const DEFAULT_CATEGORY_ICON = '🏪';
