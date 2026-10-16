import { api } from './api';

export const usersService = {
  getAll:    (params) => api.get('/dashboard/users', params),
  getById:   (id)     => api.get(`/dashboard/users/${id}`),
  create:    (body)   => api.post('/dashboard/users', body),
  update:    (id, body) => api.put(`/dashboard/users/${id}`, body),
  remove:    (id)     => api.delete(`/dashboard/users/${id}`),
};
