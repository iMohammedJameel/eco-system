const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");
const { SUCCESS, ERROR } = require("../utils/httpStatusText");

const getAllUsers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  res.status(200).json({
    status: SUCCESS,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    data: users,
  });
});

const getUserById = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(appError.create("User not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const createUser = asyncWrapper(async (req, res, next) => {
  const { username, email, phoneNumber, password } = req.body;

  const existUser = await User.findOne({ email });
  if (existUser) return next(appError.create("Email already in use", 400, ERROR));

  await User.create({ username, email, phoneNumber, password });
  res.status(201).json({ status: SUCCESS, msg: "User created" });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  const { username, email, phoneNumber, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { username, email, phoneNumber, isActive },
    { new: true, runValidators: true }
  );
  if (!user) return next(appError.create("User not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, data: user });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(appError.create("User not found", 404, ERROR));
  res.status(200).json({ status: SUCCESS, msg: "User deleted" });
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
