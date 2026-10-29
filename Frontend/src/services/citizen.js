import { api } from './api';

/**
 * بوابة المواطن — المحفظة والسجل والكوبونات والبروفايل
 * كل المسارات محمية بدور user (verifyToken + allowedTo)
 */
export const citizenService = {
  // الملخص الكامل للمحفظة في طلب واحد
  getWallet: () => api.get('/auth/wallet'),

  // بروفايلي
  getMe: () => api.get('/auth/me'),
  updateMe: (payload) => api.put('/auth/me', payload),
  changePassword: (payload) => api.put('/auth/me/change-password', payload),

  // سجل معاملاتي (ترقيم + فلتر النوع)
  getMyTransactions: (params) => api.get('/transactions/my', params),

  // كوبوناتي
  getMyCoupons: () => api.get('/dashboard/coupons/my'),
};
