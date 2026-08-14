const User = require("../models/user");
const ok = require("../utils/ok");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).select("-password");
  ok(res, users, "List of all users");
});

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw new AppError("user not found", 404);
  }
  ok(res, user, "user found");
});

const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("user not found", 404);
  }

  const { name, email, password, role } = req.body || {};

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (password !== undefined) user.password = password;
  if (role !== undefined) user.role = role;

  await user.save();
  const userResponse = user.toObject();
  delete userResponse.password;
  return ok(res, userResponse, "user info updated successfully");
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("user not found", 404);
  }
  await user.deleteOne();
  const userResponse = user.toObject();
  delete userResponse.password;
  return ok(res, userResponse, "user info deleted successfully");
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
