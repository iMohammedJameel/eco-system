# نقاء - Naqa ♻️

> Smart Recycling Management System — Admin Dashboard

---

## 📌 Overview

Naqa is a smart recycling platform that allows admins to monitor recycling machines, manage users, and track financial reports through a modern admin dashboard.

---

## 🗂️ Project Structure

```
eco-system/
├── Backend/        → Node.js + Express REST API
├── Frontend/       → React.js + Vite Admin Dashboard
└── Mobile/         → Mobile App (coming soon)
```

---

## 🚀 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Joi Validation
- bcrypt
- Morgan

### Frontend
- React.js + Vite
- React Router DOM
- Recharts
- CSS Modules

---

## ⚙️ Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file from `.env.example`:

```env
PORT=4000
NODE_ENV=dev
MONGO_URI=mongodb://localhost:27017/naqa
JWT_SECRET=your_secret_key_here
ADMIN_EMAIL=admin@naqa.com
ADMIN_PASSWORD=admin123456
```

Seed the super admin:

```bash
npm run seed
```

Run the server:

```bash
npm run dev
```

---

## 🎨 Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### Admin Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/dashboard/login` | Admin login |

### User Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/users` | Get all users |
| GET | `/api/dashboard/users/:id` | Get user by ID |
| POST | `/api/dashboard/users` | Create user |
| PUT | `/api/dashboard/users/:id` | Update user |
| DELETE | `/api/dashboard/users/:id` | Delete user |

### Machines (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/machines` | Get all machines |
| GET | `/api/dashboard/machines/:id` | Get machine by ID |
| POST | `/api/dashboard/machines` | Create machine |
| PUT | `/api/dashboard/machines/:id` | Update machine |
| DELETE | `/api/dashboard/machines/:id` | Delete machine |

---

## 📊 Dashboard Pages

| Page | Description |
|------|-------------|
| Login | Admin authentication |
| Dashboard | Overview stats, charts, recent activity |
| Machines | Manage recycling machines |
| Users | Manage registered users |
| Financial Reports | Revenue charts and monthly details |

---

## 👥 Team

Capstone Project — Second Semester
