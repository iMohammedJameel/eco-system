import { api } from './api';

export const machinesService = {
  getAll:    (params) => api.get('/dashboard/machines', params),
  getById:   (id)     => api.get(`/dashboard/machines/${id}`),
  create:    (body)   => api.post('/dashboard/machines', body),
  update:    (id, body) => api.put(`/dashboard/machines/${id}`, body),
  remove:    (id)     => api.delete(`/dashboard/machines/${id}`),
};
