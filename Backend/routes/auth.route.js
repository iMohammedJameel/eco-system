// Require Express
const express = require("express");
// Router
const router = express.Router();
// Require Controller
const loginAdmin = require("../controllers/authAdmin.controller");
const validationSchema = require("../middleware/validationSchema");
const loginSchema = require("../controllers/validation/authAdminValidation");
// Init Method Request
router.post("/login", validationSchema(loginSchema), loginAdmin);
// Export
module.exports = router;
