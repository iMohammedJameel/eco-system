import { api } from './api';

export const notificationsService = {
  getAll:    (params)        => api.get('/dashboard/notifications', params),
  getById:   (id)            => api.get(`/dashboard/notifications/${id}`),
  create:    (body)          => api.post('/dashboard/notifications', body),
  update:    (id, body)      => api.put(`/dashboard/notifications/${id}`, body),
  remove:    (id)            => api.delete(`/dashboard/notifications/${id}`),
};
