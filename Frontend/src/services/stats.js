import { api } from './api';

export const statsService = {
  getOverview: () => api.get('/dashboard/stats'),
  getMonthly:  () => api.get('/dashboard/stats/monthly'),
  getMaterials: () => api.get('/dashboard/stats/materials'),
  getTodayHourly: () => api.get('/dashboard/stats/today-hourly'),
  getWeekDaily: () => api.get('/dashboard/stats/week-daily'),
  getLeaderboard: (params) => api.get('/dashboard/stats/leaderboard', params),
  // تحليل تنبؤي — امتلاء الماكينات
  getMachineForecasts: () => api.get('/dashboard/stats/machine-forecasts'),
};
