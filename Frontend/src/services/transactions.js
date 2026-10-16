import { api } from './api';

export const transactionsService = {
  getAll:  (params) => api.get('/transactions', params),
  getById: (id)     => api.get(`/transactions/${id}`),
};
