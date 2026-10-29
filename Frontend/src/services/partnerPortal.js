import { api } from './api';

/**
 * بوابة الشركاء — الشريك المسجّل دخوله (role=partner)
 * كل العمليات مقيّدة بسجل الشريك نفسه على السيرفر
 */
export const partnerPortalService = {
  // البروفايل + إحصائيات الكوبونات
  getMe: () => api.get('/partner-portal/me'),

  // كوبونات الشريك
  getCoupons: () => api.get('/partner-portal/coupons'),

  // استبدال كوبون
  redeem: (code) => api.patch('/partner-portal/redeem', { code }),

  // إدارة العروض — على سجل الشريك نفسه فقط
  addOffer: (payload) => api.post('/partner-portal/offers', payload),
  updateOffer: (offerId, payload) => api.patch(`/partner-portal/offers/${offerId}`, payload),
  removeOffer: (offerId) => api.delete(`/partner-portal/offers/${offerId}`),
};
