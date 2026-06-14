const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");

const registerUser = asyncWrapper(async (req, res, next) => {
  const { username, email, phoneNumber, password } = req.body;

  const existUser = await User.findOne({ email });
  if (existUser) return next(appError.create("Email already in use", 400, ERROR));

  await User.create({ username, email, phoneNumber, password });
  res.status(201).json({ status: SUCCESS, msg: "Register success" });
});

const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(appError.create("Invalid email or password", 400, ERROR));

  if (!user.isActive) return next(appError.create("Account is disabled", 403, ERROR));

  const matched = await user.comparePassword(password);
  if (!matched) return next(appError.create("Invalid email or password", 400, ERROR));

  const token = jwt.sign(
    { id: user._id, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ status: SUCCESS, token });
});

const getMe = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(appError.create("User not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const updateMe = asyncWrapper(async (req, res, next) => {
  const { username, phoneNumber } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username, phoneNumber },
    { new: true, runValidators: true }
  );
  if (!user) return next(appError.create("User not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const changePassword = asyncWrapper(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!user) return next(appError.create("User not found", 404, ERROR));

  const matched = await user.comparePassword(currentPassword);
  if (!matched) return next(appError.create("Current password is incorrect", 400, ERROR));

  user.password = newPassword;
  await user.save();

  res.status(200).json({ status: SUCCESS, msg: "Password updated" });
});

module.exports = { registerUser, loginUser, getMe, updateMe, changePassword };
