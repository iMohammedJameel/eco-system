import { api } from './api';

export const achievementsService = {
  getAll:    ()              => api.get('/dashboard/achievements'),
  getById:   (id)            => api.get(`/dashboard/achievements/${id}`),
  create:    (body)          => api.post('/dashboard/achievements', body),
  update:    (id, body)      => api.put(`/dashboard/achievements/${id}`, body),
  remove:    (id)            => api.delete(`/dashboard/achievements/${id}`),
};
