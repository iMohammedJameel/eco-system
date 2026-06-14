const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { ERROR } = require("../utils/httpStatusText");

const loginAdmin = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select("+password");
  if (!admin) return next(appError.create("Invalid email or password", 400, ERROR));

  const matched = await admin.comparePassword(password);
  if (!matched) return next(appError.create("Invalid email or password", 400, ERROR));

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ status: "success", token });
});

module.exports = loginAdmin;
