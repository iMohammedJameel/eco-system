# EcoCycle — Frontend

لوحة تحكم عربية (RTL) لمنصة EcoCycle لإعادة التدوير — React 19 + Vite 8 + CSS Modules.

## التشغيل

```bash
npm install
npm run dev      # http://localhost:5173
```

يتطلب تشغيل الـ Backend أولًا على المنفذ 4000 (Vite يعمل كـ proxy تلقائي لكل مسارات `/api`).

```bash
npm run build    # بناء الإنتاج
npm run preview  # معاينة نسخة الإنتاج
npm run lint     # فحص ESLint
```

## البنية

```
src/
  components/    # Sidebar/Navbar (ديزاين معتمد) + Dashboard widgets + UI kit
  pages/         # 16 صفحة عربية RTL
  services/      # API client (auto-refresh + download)
  context/       # AuthContext + ToastContext
```
