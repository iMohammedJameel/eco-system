# ♻️ EcoCycle — Smart Recycling Platform

> A full-stack admin platform for managing a smart reverse vending machine (RVM) network across Egypt, tracking recycling transactions, and rewarding users for recycling behavior.

---

## 🧩 Project Overview

EcoCycle is part of the **ذكاء التدوير (Smart Recycling Egypt)** initiative — a graduation project under Egypt's **Digilians** program. The system connects IoT-based reverse vending machines with a web admin dashboard and a mobile app to encourage plastic bottle recycling through a reward-based system.

This repository contains:
- **Backend** — RESTful API built with Node.js, Express, and MongoDB
- **Frontend** — React.js admin dashboard for monitoring machines, users, and recycling stats

---

## ✨ Features

### 🖥️ Admin Dashboard
- Real-time stats: total users, active machines, revenue, and recycled weight
- Interactive recycling trend charts (Recharts)
- Machine map with governorate-level tracking
- Top machines by collection volume
- Recent activity feed

### 🤖 Machine Management
- Full CRUD for reverse vending machines
- Machine status tracking: `active`, `nearlyFull`, `offline`
- Fill percentage monitoring and last ping timestamp
- GPS coordinates per machine (lat/lng)

### 👤 User Management
- User registration and login with JWT authentication
- View and manage all registered users
- User reward balance tracking

### 📊 Transactions & Reports
- Deposit and withdrawal transaction records
- Material type tracking: `plastic`, `glass`, `cardboard`, `paper`
- Weight (kg) and items count per transaction
- Withdrawal methods: `bank` or `mobile_wallet`
- Monthly revenue and recycling analytics via MongoDB aggregation

### 🔐 Security
- JWT-based authentication for both admin and user roles
- Role-based access control (`superAdmin`, `operationsManager`)
- Rate limiting on all auth endpoints (10 requests / 15 min)
- Joi validation on all input schemas
- Centralized error handling middleware

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Joi | Input validation |
| Express Rate Limit | API rate limiting |
| Morgan | HTTP request logging |

### Frontend
| Technology | Purpose |
|---|---|
| React.js 19 | UI framework |
| Vite | Build tool |
| React Router v7 | Client-side routing |
| Recharts | Data visualization |
| CSS Modules | Component styling |

---

## 📁 Project Structure

```
eco-system/
├── Backend/
│   ├── app.js                  # Entry point
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authAdmin.controller.js
│   │   ├── authUser.controller.js
│   │   ├── machine.controller.js
│   │   ├── stats.controller.js
│   │   ├── transaction.controller.js
│   │   ├── user.controller.js
│   │   └── validation/         # Joi schemas
│   ├── middleware/
│   │   ├── allowedTo.js        # Role-based access
│   │   ├── asyncWrapper.js     # Async error wrapper
│   │   ├── validationSchema.js # Joi middleware
│   │   └── verifyToken.js      # JWT middleware
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Machine.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── authUser.route.js
│   │   ├── machine.route.js
│   │   ├── stats.route.js
│   │   ├── transaction.route.js
│   │   └── user.route.js
│   ├── utils/
│   │   ├── appError.js
│   │   ├── generateJWT.js
│   │   └── httpStatusText.js
│   └── scripts/
│       └── seed.js             # Database seeder
│
└── Frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard/
        │   ├── Machines/
        │   ├── Users/
        │   ├── Reports/
        │   └── Login/
        ├── components/
        │   ├── Dashboard/      # StatsCard, RecyclingChart, MachinesMap...
        │   ├── Machines/       # MachinesTable, MachinesFilters...
        │   ├── Reports/        # RevenueChart, RevenueDonut...
        │   ├── Users/          # UsersTable, UsersStats...
        │   ├── layout/         # Navbar, Sidebar
        │   └── ui/             # Button, Input
        └── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/iMohammedJameel/eco-system.git
cd eco-system
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

Create a `.env` file based on `.env.example`:
```env
PORT=4000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=dev
```

Run the server:
```bash
npm run dev
```

Seed the database (optional):
```bash
npm run seed
```

### 3. Setup Frontend
```bash
cd ../Frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`
Backend runs on: `http://localhost:4000`

---

## 📡 API Endpoints

### Admin Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/dashboard/login` | Admin login |

### User Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |

### Machines (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/machines` | Get all machines |
| GET | `/api/dashboard/machines/:id` | Get machine by ID |
| POST | `/api/dashboard/machines` | Create machine |
| PUT | `/api/dashboard/machines/:id` | Update machine |
| DELETE | `/api/dashboard/machines/:id` | Delete machine |

### Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/users` | Get all users |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Create transaction |

### Stats (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

---

## 👨‍💻 Author

**Mohammed Jameel Fouad**
- GitHub: [@iMohammedJameel](https://github.com/iMohammedJameel)
- LinkedIn: [linkedin.com/in/imohammedjameel](https://linkedin.com/in/imohammedjameel)
- Portfolio: [imohammedjameel.github.io](https://imohammedjameel.github.io)

---

## 📄 License

This project is part of the **Digilians** AI-Based Software Development Diploma — Egyptian Military Academy.
