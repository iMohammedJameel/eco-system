import { api } from './api';

export const pricingService = {
  getAll:    ()              => api.get('/dashboard/pricing'),
  getById:   (id)            => api.get(`/dashboard/pricing/${id}`),
  create:    (body)          => api.post('/dashboard/pricing', body),
  update:    (id, body)      => api.put(`/dashboard/pricing/${id}`, body),
  remove:    (id)            => api.delete(`/dashboard/pricing/${id}`),
};
