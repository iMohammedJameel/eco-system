const express = require("express");
const router = express.Router();
const { exportReport } = require("../controllers/report.controller");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");

// تصدير Excel — أدمن
router.get("/export", verifyToken, allowedTo("superAdmin", "operationsManager"), exportReport);

module.exports = router;
