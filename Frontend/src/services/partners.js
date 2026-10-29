import { api } from './api';

export const partnersService = {
  getAll:    (params)        => api.get('/dashboard/partners', params),
  getById:   (id)            => api.get(`/dashboard/partners/${id}`),
  create:    (body)          => api.post('/dashboard/partners', body),
  update:    (id, body)      => api.put(`/dashboard/partners/${id}`, body),
  remove:    (id)            => api.delete(`/dashboard/partners/${id}`),

  // عروض الخصومات — عمليات ذرّية على عنصر واحد (بدل إعادة كتابة الـ array كله)
  addOffer:      (id, body)      => api.post(`/dashboard/partners/${id}/offers`, body),
  updateOffer:   (id, offerId, body) => api.patch(`/dashboard/partners/${id}/offers/${offerId}`, body),
  removeOffer:   (id, offerId)   => api.delete(`/dashboard/partners/${id}/offers/${offerId}`),
};
