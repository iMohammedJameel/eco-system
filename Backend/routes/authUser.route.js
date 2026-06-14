// Require Express
const express = require("express");
// Router
const router = express.Router();
// Require Controller
const { registerUser, loginUser, getMe, updateMe, changePassword } = require("../controllers/authUser.controller");
const validationSchema = require("../middleware/validationSchema");
const { registerSchema, loginSchema } = require("../controllers/validation/authUserValidation");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require("../middleware/allowedTo");
// Init Method Requests
router.post("/register", validationSchema(registerSchema), registerUser);
router.post("/login", validationSchema(loginSchema), loginUser);
router.get("/me", verifyToken, allowedTo("user"), getMe);
router.put("/me", verifyToken, allowedTo("user"), updateMe);
router.put("/me/change-password", verifyToken, allowedTo("user"), changePassword);
// Export
module.exports = router;
