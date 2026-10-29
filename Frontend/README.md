# EcoCycle — Frontend

Bilingual (English LTR / Arabic RTL) admin dashboard for the EcoCycle recycling platform — React 19 + Vite 8 + CSS Modules.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
```

Requires the Backend running first on port 4000 (Vite automatically proxies all `/api` routes).

## Scripts

```bash
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # ESLint check
```

## Structure

```
src/
  components/    # Sidebar/Navbar + Dashboard widgets + full UI kit
  pages/         # 16 pages × 2 languages (EN / AR)
  i18n/          # translations + per-page language patches
  services/      # API client (auto-refresh + file downloads)
  context/       # AuthContext + LanguageContext + ToastContext
```

The language toggles live from the navbar — Arabic switches the whole layout to RTL, English back to LTR.
