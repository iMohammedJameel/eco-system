<div align="center">

# ♻️ EcoCycle — Smart Waste Recycling Platform

**A bilingual (English / Arabic RTL) smart-recycling platform for Egypt** — Graduation Project · Digilians LAB 3 · Mohammed Jameel Fouad

[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tests](https://img.shields.io/badge/tests-34%2F34%20passing-brightgreen)](Backend/tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*A full-stack platform that closes the recycling loop: smart machines → QR deposits → wallet rewards → partner coupons — with fraud detection, fill forecasting, audit logging, and real Excel/PDF reporting.*

**English (LTR) and Arabic (RTL) ship together — every screen, live-toggled from the navbar.**

</div>

---

## 🚀 Quick Start (requires MongoDB on `localhost:27017`)

```bash
# Backend — API + docs on http://localhost:4000
cd Backend  && npm install && cp .env.example .env && npm run seed && npm run dev

# Frontend — http://localhost:5173 (proxies /api → :4000)
cd Frontend && npm install && npm run dev
```

| Demo account | Email | Password |
|---|---|---|
| Super Admin | `admin@ecocycle.com` | `admin123456` |
| Operations Manager | `ops@ecocycle.com` | `ops123456` |
| Citizen (user) | `user1@ecocycle.com` | `user123456` |

---

## ♻️ How It Works — The Circular Economy Loop

1. A citizen scans the **QR code** on a smart recycling machine.
2. A public **PWA page** opens on their phone — they enter their mobile number, pick the material, and set the weight.
3. Their **wallet is instantly credited** (EGP) at the current per-kg price — first-time users are auto-created.
4. They redeem wallet balance for **partner coupons** (supermarkets, stores) — partners verify and honor them via the **partner portal**.
5. Every deposit feeds the **achievements engine** (badges + XP), the **leaderboard**, **fill forecasting**, and **fraud detection**.

---

## ✨ Key Features

### 🔐 Security & Identity
- **JWT access tokens (15 min) + refresh tokens in httpOnly cookies** with automatic rotation — a refresh token can never be used as an access token
- **Account lockout**: 5 failed attempts → 15-minute lock, with timing-attack mitigation (dummy bcrypt compare)
- **RBAC** with four roles: `superAdmin`, `operationsManager`, `user`, `partner` (real partner accounts with the same lockout / rotation / audit security as admins)
- Helmet (11 security headers) + custom Express-5-compatible **NoSQL injection sanitizer**
- Per-route **rate limiting** on all auth endpoints
- **"Remember me"** with real logic: 30-day refresh token vs. 1-day session cookie
- Full **audit log** of every admin mutation (create/update/delete) + dedicated system-log page
- Password reset flow with single-use 15-minute tokens signed by a dedicated secret

### ♻️ The Circular Economy Loop
- **QR deposit flow**: scan machine QR → public PWA page (`/deposit?t=...`) → enter phone number → instant balance (auto-creates first-time users)
- **Coupons**: users redeem wallet balance for partner discount coupons — atomic `$inc` with insufficient-balance guard, full financial ledger, **expiry enforcement** (expired coupons can never be redeemed)
- **Partner portal (real authentication)**: each partner logs in with their own credentials (JWT `role=partner`, scoped refresh cookie) to verify coupons and manage their offers
- **Citizen self-service pages**: My Wallet, My History, My Coupons, My Profile — full financial visibility without admin help
- **Achievements engine**: auto-unlocks badges after every deposit, with XP rewards and notifications
- Anti-fraud guard: every QR token can be used exactly once

### 🧠 Operational Intelligence
- **Machine fill forecasting** (14-day moving average) — *"this machine will be full in ~X hours"* on the ops dashboard
- **Fraud detection**: 5 deposits / 15 min or 2 different governorates / 10 min → auto-flag + high-priority issue
- **Live map** of all machines (Leaflet + OpenStreetMap, no API key) with color-coded status pins

### 📊 Reports & DX
- Real **Excel exports** (exceljs) — transactions / monthly / materials / coupons, with proper Arabic text encoding
- Print-ready **PDF views** with full RTL support
- Live **Swagger UI** at `/api/docs` — 80+ OpenAPI-annotated endpoints + complete **Postman collection**
- **Safe user deletion**: removing a user cascades to their transactions, coupons, notifications and issues — no orphan records

### 🌍 Bilingual UI (English / Arabic)
- **Live language toggle** in the navbar — English (LTR) and Arabic (RTL) across all 23 pages
- **Dark mode** with a navbar toggle — system preference detection, persisted choice, and full RTL-aware dark styling
- Custom **404 page** (bilingual) for unknown routes
- **Dashboard charts run on real aggregations** — today / week / month KPIs and trend charts query live MongoDB pipelines, not mock data
- Full **RTL layout mirroring** for Arabic: right-aligned tables, flipped sidebars, mirrored modals
- **Bilingual login designs**: the Arabic login is the approved pixel-perfect design; the English login is a clean rebuild with the same identity
- Arabic-first API responses and validation messages (Joi schemas with Arabic error text)

### 🧪 Quality
- **34 automated tests** (`node --test` + supertest): auth, lockout, refresh rotation, atomic balance ops, coupons (incl. **expired-coupon rejection**), stats, PWA deposit, fraud detection, remember-me, password reset, **cascade delete**, Arabic messages
- **Seed data validator** (`npm run validate:seed`) — 12-section integrity check (counts, uniqueness, referential integrity, **ledger accuracy to the cent**)
- **Live smoke suite** (`npm run smoke`) — 51 end-to-end checks against a running server
- Docker + docker-compose (mongo + backend + nginx frontend)

---

## 🖼️ Screenshots — English & Arabic

Every page ships in both languages. Each pair below shows the same screen in English (left) and Arabic (right, full RTL).

### 🔐 Login

| English | Arabic (RTL) |
|:---:|:---:|
| ![Login EN](docs/screenshots/en/login.jpg) | ![Login AR](docs/screenshots/ar/login.jpg) |

### 🏠 Dashboard

| English | Arabic (RTL) |
|:---:|:---:|
| ![Dashboard EN](docs/screenshots/en/dashboard.jpg) | ![Dashboard AR](docs/screenshots/ar/dashboard.jpg) |

KPI stats, recycling trend chart, recent activity, top machines and the live map.

### 📍 Machines

| English | Arabic (RTL) |
|:---:|:---:|
| ![Machines EN](docs/screenshots/en/machines.jpg) | ![Machines AR](docs/screenshots/ar/machines.jpg) |

Smart-machine network with a live Leaflet map, color-coded status pins and fill levels.

### 🧭 Ops Dashboard

| English | Arabic (RTL) |
|:---:|:---:|
| ![Ops EN](docs/screenshots/en/ops-dashboard.jpg) | ![Ops AR](docs/screenshots/ar/ops-dashboard.jpg) |

Operational command center: fill forecasting, machine states and flagged issues.

### 💸 Transactions

| English | Arabic (RTL) |
|:---:|:---:|
| ![Transactions EN](docs/screenshots/en/transactions.jpg) | ![Transactions AR](docs/screenshots/ar/transactions.jpg) |

Full deposit ledger with filters, search and one-click Excel export.

### 👥 Users

| English | Arabic (RTL) |
|:---:|:---:|
| ![Users EN](docs/screenshots/en/users.jpg) | ![Users AR](docs/screenshots/ar/users.jpg) |

Citizen accounts, wallet balances and activity management.

### 🏆 Leaderboard

| English | Arabic (RTL) |
|:---:|:---:|
| ![Leaderboard EN](docs/screenshots/en/leaderboard.jpg) | ![Leaderboard AR](docs/screenshots/ar/leaderboard.jpg) |

Top-recycler rankings with points and badges.

### 🎖️ Achievements

| English | Arabic (RTL) |
|:---:|:---:|
| ![Achievements EN](docs/screenshots/en/achievements.jpg) | ![Achievements AR](docs/screenshots/ar/achievements.jpg) |

Gamified badges auto-unlocked by the achievements engine after every deposit.

### 🎟️ Coupons

| English | Arabic (RTL) |
|:---:|:---:|
| ![Coupons EN](docs/screenshots/en/coupons.jpg) | ![Coupons AR](docs/screenshots/ar/coupons.jpg) |

Discount coupons redeemed from wallet balance — atomic, ledger-backed.

### 🤝 Partners

| English | Arabic (RTL) |
|:---:|:---:|
| ![Partners EN](docs/screenshots/en/partners.jpg) | ![Partners AR](docs/screenshots/ar/partners.jpg) |

Partner network of supermarkets and stores honoring redeemed coupons.

### 💰 Pricing

| English | Arabic (RTL) |
|:---:|:---:|
| ![Pricing EN](docs/screenshots/en/pricing.jpg) | ![Pricing AR](docs/screenshots/ar/pricing.jpg) |

Per-kg material pricing in EGP — the rates that drive wallet credits.

### 🛠️ Issues

| English | Arabic (RTL) |
|:---:|:---:|
| ![Issues EN](docs/screenshots/en/issues.jpg) | ![Issues AR](docs/screenshots/ar/issues.jpg) |

Maintenance tickets, including auto-generated fraud flags.

### 📊 Reports

| English | Arabic (RTL) |
|:---:|:---:|
| ![Reports EN](docs/screenshots/en/reports.jpg) | ![Reports AR](docs/screenshots/ar/reports.jpg) |

Revenue analytics with charts and real Excel/PDF exports.

### 🕵️ Audit Logs

| English | Arabic (RTL) |
|:---:|:---:|
| ![Audit EN](docs/screenshots/en/audit-logs.jpg) | ![Audit AR](docs/screenshots/ar/audit-logs.jpg) |

A tamper-evident trail of every admin mutation.

### 🔔 Notifications

| English | Arabic (RTL) |
|:---:|:---:|
| ![Notifications EN](docs/screenshots/en/notifications.jpg) | ![Notifications AR](docs/screenshots/ar/notifications.jpg) |

Announcements broadcast to citizens.

### 📱 PWA Deposit Flow (mobile)

| English | Arabic (RTL) |
|:---:|:---:|
| ![PWA EN](docs/screenshots/en/pwa-deposit.jpg) | ![PWA AR](docs/screenshots/ar/pwa-deposit.jpg) |

The QR deposit flow on a phone: scan → enter phone & pick material → set weight → instant credit.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js 24 · Express 5.2 · Mongoose 9.6 (MongoDB) · JWT (jsonwebtoken) · Joi 18 validation · bcrypt · helmet · express-rate-limit · exceljs · swagger-jsdoc |
| **Frontend** | React 19 · Vite 8 · CSS Modules · Recharts 3 · Leaflet (react-leaflet) · lucide-react · React Router 7 |
| **Infra** | Docker · docker-compose · nginx reverse proxy · Morgan logging |

## 🏗️ Architecture

```
eco-system-main/
├── Backend/
│   ├── app.js / server.js        # Express 5 + Helmet + Sanitizer + CORS + Swagger
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # 12 models (User, Admin, Machine, Transaction,
│   │                             #   Coupon, Partner, Pricing, Achievement, AuditLog, ...)
│   ├── controllers/              # 14 controllers + Joi validation schemas (Arabic messages)
│   ├── routes/                   # REST routes with RBAC (allowedTo) middleware
│   ├── middleware/               # verifyToken, allowedTo, validationSchema, asyncWrapper
│   ├── utils/                    # achievementEngine, fraudDetection, fillForecast,
│   │                             #   audit logger, JWT helpers (access/refresh/reset)
│   ├── scripts/                  # seed.js · validateSeed.js · liveSmoke.js · makeQrSession.js
│   ├── tests/                    # 32 automated tests (node:test + supertest)
│   ├── Dockerfile
│   └── EcoCycle.postman_collection.json
├── Frontend/
│   ├── src/components/           # Sidebar/Navbar + Leaflet map + dashboard widgets
│   │                             #   + full UI kit (Modal, Toast, CommandPalette, ...)
│   ├── src/pages/                # 23 pages × 2 languages (EN LTR / AR RTL),
│   │                             #   incl. Coupons, Audit Logs, PWA Deposit,
│   │                             #   Register, Forgot Password, Partner Portal,
│   │                             #   Citizen area (Wallet/History/Coupons/Profile),
│   │                             #   Partner Login, 404 NotFound
│   ├── src/services/             # API client with auto-refresh + file downloads
│   ├── src/i18n/                 # translations.js + per-page translation patches
│   ├── src/context/              # AuthContext + LanguageContext + ToastContext + ThemeContext (dark mode)
│   ├── Dockerfile · nginx.conf
│   └── vite.config.js            # /api proxy → :4000
├── docs/screenshots/             # en/ + ar/ — bilingual screenshots for this README
├── docker-compose.yml
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (built and tested on 24)
- **MongoDB** running on `localhost:27017` (local install, Atlas URI, or the docker-compose service)

### Option 1 — Manual (development)

```bash
# 1) Backend
cd Backend
npm install
cp .env.example .env        # then edit secrets (see table below)
npm run seed                # full demo dataset (users, machines, transactions, coupons...)
npm run dev                 # http://localhost:4000 — API docs at /api/docs

# 2) Frontend (new terminal)
cd Frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api → :4000)
```

### Option 2 — Docker (production-style)

```bash
docker compose up -d        # frontend: http://localhost:8080 · API: http://localhost:4000/api/docs
```

### Environment variables (`Backend/.env`)

| Variable | Purpose | Default in `.env.example` |
|---|---|---|
| `PORT` | API port | `4000` |
| `NODE_ENV` | environment | `dev` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017/ecocycle` |
| `JWT_SECRET` | access-token secret | — **set a strong random value** |
| `JWT_REFRESH_SECRET` | refresh-token secret | — **set a strong random value** |
| `JWT_RESET_SECRET` | password-reset secret | — **set a strong random value** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | super-admin created by seed | `admin@ecocycle.com` / `admin123456` |
| `TEST_MONGO_URI` | isolated DB for `npm test` | `mongodb://127.0.0.1:27017/ecocycle_test` |

> 🔒 Generate strong secrets with `openssl rand -hex 32`. Demo credentials are for development only — change them before any real deployment.

## 🧪 Testing & Verification

```bash
cd Backend
npm test              # 32/32 automated tests (uses an isolated test database)
npm run seed          # re-seed demo data
npm run validate:seed # 12-section seed integrity audit — ledger accurate to the cent
npm run smoke         # 51 live end-to-end checks (requires server running on :4000)
```

Coverage highlights: auth for all 3 roles · account lockout · refresh-token rotation & reuse protection · refresh-token-rejected-as-access · atomic deposit/withdraw/coupon redemption (no race conditions) · insufficient-balance safety · stats & leaderboard filters · public PWA deposit (auto account, one-time QR) · fraud rules · remember-me durations · password reset flow · Arabic error messages end-to-end.

## 📚 API Documentation

- **Swagger UI** (live): `http://localhost:4000/api/docs`
- **Postman collection**: [`Backend/EcoCycle.postman_collection.json`](Backend/EcoCycle.postman_collection.json)

## 📄 License

Released under the [MIT License](LICENSE) — © 2026 Mohammed Jameel Fouad.

---

<div align="center">

**Graduation Project** — Digilians LAB 3 · Mohammed Jameel Fouad

*"From waste to worth — closing the recycling loop in Egypt."* 🌿

</div>
