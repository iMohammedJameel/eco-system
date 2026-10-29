/** ثوابت صفحة الإيداع العامة (QR) — التسميات عبر i18n */

export const MATERIALS = [
  { key: 'plastic',   labelKey: 'dashboard.matPlastic',   emoji: '🥤' },
  { key: 'glass',     labelKey: 'dashboard.matGlass',     emoji: '🍶' },
  { key: 'cardboard', labelKey: 'dashboard.matCardboard', emoji: '📦' },
  { key: 'paper',     labelKey: 'dashboard.matPaper',     emoji: '📄' },
];

/** أسعار احتياطية — تُستخدم فقط لو مفيش سجل Pricing للمادة في السيرفر */
export const PRICES_FALLBACK = { plastic: 5, glass: 3, cardboard: 4, paper: 2 };

/** سعر المادة من قائمة خامات السيرفر أو الاحتياطي */
export function priceOf(materials, key) {
  return materials.find((m) => m.materialType === key)?.pricePerKg ?? PRICES_FALLBACK[key];
}
