const express = require("express");
const router = express.Router();
const { getDashboardStats, getMonthlyStats, getMaterialStats } = require("../controllers/stats.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

router.get("/", verifyToken, allowedTo("superAdmin", "operationsManager"), getDashboardStats);
router.get("/monthly", verifyToken, allowedTo("superAdmin", "operationsManager"), getMonthlyStats);
router.get("/materials", verifyToken, allowedTo("superAdmin", "operationsManager"), getMaterialStats);

module.exports = router;
