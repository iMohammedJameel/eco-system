/** ثوابت ومساعدات عرض الكوبونات — مشتركة بين الصفحة والجدول */

export const STATUS_META = {
  issued:    { labelKey: 'coupons.stIssued',   cls: 'issued' },
  redeemed:  { labelKey: 'coupons.stRedeemed', cls: 'redeemed' },
  cancelled: { labelKey: 'coupons.stCancelled', cls: 'cancelled' },
  expired:   { labelKey: 'coupons.stExpired',  cls: 'expired' },
};

/** "منتهي" حالة محسوبة: كوبون مُصدر انتهت صلاحيته */
export function statusOf(c) {
  if (c.status === 'issued' && c.expiresAt && new Date(c.expiresAt) < new Date()) {
    return STATUS_META.expired;
  }
  return STATUS_META[c.status] || STATUS_META.issued;
}

/** تنسيق تاريخ الانتهاء حسب اللغة الحالية (ar-EG / en-US) */
export function formatDate(iso, lang = 'ar') {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const EMPTY_PAGINATION = { total: 0, page: 1, limit: 12, pages: 1 };
export const EMPTY_LIST = { data: [], pagination: EMPTY_PAGINATION, stats: {} };
