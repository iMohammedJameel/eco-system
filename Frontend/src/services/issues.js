import { api } from './api';

export const issuesService = {
  getAll:    (params)        => api.get('/dashboard/issues', params),
  getById:   (id)            => api.get(`/dashboard/issues/${id}`),
  update:    (id, body)      => api.put(`/dashboard/issues/${id}`, body),
  remove:    (id)            => api.delete(`/dashboard/issues/${id}`),
  getStats:  ()              => api.get('/dashboard/issues/stats'),
};
