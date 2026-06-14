require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

app.use(express.json());
app.use(cors());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: "error", msg: "Too many requests, please try again later" },
});

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

const connectedDB = require("./config/db");
connectedDB();

// Routes
const authRoutes        = require("./routes/auth.route");
const authUserRoutes    = require("./routes/authUser.route");
const userRoutes        = require("./routes/user.route");
const machineRoutes     = require("./routes/machine.route");
const transactionRoutes = require("./routes/transaction.route");
const statsRoutes       = require("./routes/stats.route");

app.use("/api/dashboard/login",        authLimiter);
app.use("/api/auth/login",             authLimiter);
app.use("/api/auth/register",          authLimiter);
app.use("/api/dashboard",              authRoutes);
app.use("/api/auth",                   authUserRoutes);
app.use("/api/dashboard/users",        userRoutes);
app.use("/api/dashboard/machines",     machineRoutes);
app.use("/api/transactions",           transactionRoutes);
app.use("/api/dashboard/stats",        statsRoutes);

// 404 Handler
app.all("*", (req, res) => {
  res.status(404).json({ status: "error", msg: "This resource is not available" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusText || "error",
    msg: err.message || "Internal server error",
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server Is Running ${port}`);
});
