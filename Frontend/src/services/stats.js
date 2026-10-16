import { api } from './api';

export const statsService = {
  getOverview: () => api.get('/dashboard/stats'),
  getMonthly:  () => api.get('/dashboard/stats/monthly'),
  getMaterials: () => api.get('/dashboard/stats/materials'),
  getLeaderboard: (params) => api.get('/dashboard/stats/leaderboard', params),
  // تحليل تنبئي — امتلاء الماكينات
  getMachineForecasts: () => api.get('/dashboard/stats/machine-forecasts'),
};
