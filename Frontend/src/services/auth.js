import { api, tokenStore, profileStore } from './api';

export const authService = {
  login: async (email, password, remember = false) => {
    const res = await api.post('/dashboard/login', { email, password, remember });
    if (res.token) {
      tokenStore.set(res.token);
      // الأدمن من الـ response (ومن الـ JWT لو غير موجود)
      const admin = res.admin || (() => {
        try {
          const payload = JSON.parse(atob(res.token.split('.')[1]));
          return { id: payload.id, role: payload.role, username: payload.name };
        } catch {
          return null;
        }
      })();
      if (admin) profileStore.set(admin);
      return { token: res.token, profile: admin };
    }
    return res;
  },

  logout: async () => {
    // إخطار السيرفر لمسح الـ refresh cookie
    try { await api.post('/dashboard/logout'); } catch { /* تجاهل */ }
    tokenStore.clear();
    window.location.href = '/login';
  },

  // ── إنشاء حساب مستخدم جديد (PWA) ──
  register: async ({ username, email, phoneNumber, password }) =>
    api.post('/auth/register', { username, email, phoneNumber, password }),

  // ── استعادة كلمة المرور (خطوتان) ──
  forgotPassword: async (email, verify) =>
    api.post('/dashboard/forgot-password', { email, verify }),

  resetPassword: async (resetToken, newPassword) =>
    api.post('/dashboard/reset-password', { resetToken, newPassword }),

  isAuthenticated: () => !!tokenStore.get(),
  getProfile: () => profileStore.get(),
};
