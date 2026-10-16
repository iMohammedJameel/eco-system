// Require Express
const express = require("express");
// Router
const router = express.Router();
// Require Controller
const { loginAdmin, refreshAdminToken, logoutAdmin, forgotPassword, resetPassword } = require("../controllers/authAdmin.controller");
const validationSchema = require("../middleware/validationSchema");
const { loginSchema, forgotSchema, resetSchema } = require("../controllers/validation/authAdminValidation");
const verifyToken = require("../middleware/verifyToken");

// Init Method Request
router.post("/login", validationSchema(loginSchema), loginAdmin);
router.post("/refresh", refreshAdminToken);
// استعادة كلمة المرور — مسار عام (تحقق مزدوج: بريد + اسم مستخدم/هاتف)
router.post("/forgot-password", validationSchema(forgotSchema), forgotPassword);
router.post("/reset-password", validationSchema(resetSchema), resetPassword);
// الخروج عام — مسح الـ cookie لازم يشتغل حتى لو الـ access token منتهي
// (وإلا المستخدم محبوس "مش قادر يخرج" لما التوكن ينتهي)
router.post("/logout", logoutAdmin);

// Export
module.exports = router;
