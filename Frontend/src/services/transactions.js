import { api } from './api';

export const transactionsService = {
  getAll:  (params) => api.get('/transactions', params),
  getById: (id)     => api.get(`/transactions/${id}`),

  /* ── مسارات الإيداع العامة (صفحة QR — بدون توكن) ── */
  /** التحقق من صلاحية رمز QR وماكينة الإيداع قبل عرض النموذج */
  getQRInfo: (qrToken) => api.get('/transactions/qr-info', { qrToken }),
  /** خامات الإيداع وأسعارها الحالية من السيرفر */
  getMaterials: () => api.get('/transactions/materials'),
  /** تسجيل إيداع عام (ربط بالرقم + فتح حساب تلقائي لأول مرة) */
  claimPublic: (payload) => api.post('/transactions/claim-public', payload),
};
