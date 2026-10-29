/**
 * EcoCycle Admin — API client
 * Thin fetch() wrapper that:
 *  - prefixes /api
 *  - injects JWT Bearer token from localStorage
 *  - parses JSON
 *  - throws on non-2xx with server-provided message
 *  - auto-refreshes expired access token ONCE via httpOnly cookie, then retries
 *  - auto-redirects to /login only when refresh also fails
 */

const BASE = '/api';
const TOKEN_KEY = 'ecocycle_admin_token';
const ADMIN_KEY = 'ecocycle_admin_profile';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
};

export const profileStore = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null');
    } catch {
      return null;
    }
  },
  set: (profile) => localStorage.setItem(ADMIN_KEY, JSON.stringify(profile)),
};

/** مسار تجديد التوكن حسب نوع الجلسة المخزّنة (أدمن/مواطن/شريك) */
function refreshPathForRole(role) {
  if (role === 'user') return '/auth/refresh';
  if (role === 'partner') return '/partner-portal/refresh';
  return '/dashboard/refresh';
}

/** تجديد الـ access token من الـ refresh cookie (httpOnly — يمر تلقائيًا) */
async function tryRefresh() {
  try {
    const role = profileStore.get()?.role;
    const res = await fetch(`${BASE}${refreshPathForRole(role)}`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.token) {
      tokenStore.set(json.token);
      // حدّث اسم/دور الجلسة لو السيرفر رجّعه (شريك/أدمن)
      if (json.partner || json.admin) {
        const prev = profileStore.get() || {};
        profileStore.set({ ...prev, ...(json.partner || json.admin) });
      }
      return json.token;
    }
    return null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, params, headers = {}, _retried = false } = {}) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const finalHeaders = { Accept: 'application/json', ...headers };
  const token = tokenStore.get();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      credentials: 'include',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('تعذّر الاتصال بالخادم. تأكد أن الـ Backend شغّال.', 0);
  }

  // ═══ انتهت صلاحية التوكن؟ جرّب تجديد واحد ثم أعد المحاولة ═══
  if (res.status === 401 && !_retried && token) {
    const newToken = await tryRefresh();
    if (newToken) {
      return request(path, { method, body, params, headers, _retried: true });
    }
  }

  let json = null;
  const text = await res.text();
  if (text) {
    try { json = JSON.parse(text); } catch { json = { msg: text }; }
  }

  if (!res.ok) {
    const message =
      (json && (json.msg || json.message)) ||
      `HTTP ${res.status}`;
    // تسجيل خروج فقط لو كان فيه جلسة حقيقية (توكن مخزّن) وانتهت صلاحيتها —
    // وليس خطأ 401 من مسارات عامة (استعادة كلمة المرور مثلًا)
    if (res.status === 401 && token) {
      tokenStore.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new ApiError(message, res.status, json);
  }

  return json || {};
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/** تحميل ملف (Excel) مع التوكن */
async function download(path, params) {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }
  const token = tokenStore.get();
  const res = await fetch(url, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError('فشل تحميل الملف', res.status);
  const blob = await res.blob();
  const filename = decodeURIComponent(
    (res.headers.get('content-disposition') || '').match(/filename\*?=(?:UTF-8'')?([^;]+)/)?.[1] || 'report.xlsx',
  ).replace(/"/g, '');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const api = {
  get:    (path, params) => request(path, { method: 'GET',    params }),
  post:   (path, body)   => request(path, { method: 'POST',   body }),
  put:    (path, body)   => request(path, { method: 'PUT',    body }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body }),
  delete: (path)         => request(path, { method: 'DELETE' }),
  download,
};
