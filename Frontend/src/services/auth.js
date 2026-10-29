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

  // ── دخول المواطن (بوابة المواطن: محفظة/سجل/كوبونات) ──
  loginUser: async (email, password, remember = false) => {
    const res = await api.post('/auth/login', { email, password, remember });
    if (res.token) {
      tokenStore.set(res.token);
      // الـ login بيرجّع التوكن فقط — نجيب الاسم من البروفايل عشان النافبار
      let profile = { role: 'user' };
      try {
        const me = await api.get('/auth/me');
        if (me?.data) {
          profile = {
            id: me.data._id,
            role: 'user',
            username: me.data.username,
            email: me.data.email,
            phoneNumber: me.data.phoneNumber,
          };
        }
      } catch { /* البروفايل الاحتياطي يكفي */ }
      profileStore.set(profile);
      return { token: res.token, profile };
    }
    return res;
  },

  // ── دخول الشريك (بوابة الشركاء الحقيقية) ──
  loginPartner: async (email, password, remember = false) => {
    const res = await api.post('/partner-portal/login', { email, password, remember });
    if (res.token) {
      tokenStore.set(res.token);
      if (res.partner) profileStore.set(res.partner);
      return { token: res.token, profile: res.partner };
    }
    return res;
  },

  logout: async () => {
    // إخطار السيرفر لمسح الـ refresh cookie المناسب ل نوع الجلسة
    const role = profileStore.get()?.role;
    const path = role === 'user' ? '/auth/logout' : role === 'partner' ? '/partner-portal/logout' : '/dashboard/logout';
    try { await api.post(path); } catch { /* تجاهل */ }
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
