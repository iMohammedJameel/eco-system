import { api } from './api';

export const couponsService = {
  getAll: (params) => api.get('/dashboard/coupons', params),
  issue:  (body) => api.post('/dashboard/coupons', body),
  redeem: (code) => api.patch('/dashboard/coupons/redeem', { code }),
  cancel: (id) => api.delete(`/dashboard/coupons/${id}`),
  getPartnerCoupons: (partnerId) => api.get(`/dashboard/coupons/partner/${partnerId}`),
};
