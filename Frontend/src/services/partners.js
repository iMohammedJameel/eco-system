import { api } from './api';

export const partnersService = {
  getAll:    (params)        => api.get('/dashboard/partners', params),
  getById:   (id)            => api.get(`/dashboard/partners/${id}`),
  create:    (body)          => api.post('/dashboard/partners', body),
  update:    (id, body)      => api.put(`/dashboard/partners/${id}`, body),
  remove:    (id)            => api.delete(`/dashboard/partners/${id}`),
};
