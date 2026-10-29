/** ثوابت عرض التسعير — مشتركة بين الصفحة والكارت والنموذج */

export const MATERIAL_OPTIONS = [
  { value: 'plastic',   labelKey: 'pricing.matPlastic',   icon: '♻',  color: '#0d6c3d' },
  { value: 'glass',     labelKey: 'pricing.matGlass',     icon: '🍾', color: '#0d6c3d' },
  { value: 'cardboard', labelKey: 'pricing.matCardboard', icon: '📦', color: '#a06a10' },
  { value: 'paper',     labelKey: 'pricing.matPaper',     icon: '📄', color: '#9e9e9e' },
];

/** خريطة value → مفتاح ترجمة اسم المادة (تُمرَّر على t) */
export const MATERIAL_LABEL_KEYS = Object.fromEntries(MATERIAL_OPTIONS.map((o) => [o.value, o.labelKey]));
export const MATERIAL_COLORS = Object.fromEntries(MATERIAL_OPTIONS.map((o) => [o.value, o.color]));

export const EMPTY_FORM = {
  materialType: '',
  pricePerKg: '',
  currency: 'EGP',
  isActive: true,
};
