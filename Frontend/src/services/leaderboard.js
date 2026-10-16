import { api } from './api';

export const leaderboardService = {
  getTop: (limit = 20) => api.get('/dashboard/stats/leaderboard', { limit }),
  getAll: (params) => api.get('/dashboard/stats/leaderboard', params),
};
