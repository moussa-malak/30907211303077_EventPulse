const express = require("express");
const Router = express.Router();
const userValidator = require("../middleware/validator/userValidator");
const User = require("../models/user");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/appError");
const ok = require("../utils/ok");

Router.use(userValidator);

const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    return next(
      new AppError("name, email, and password are all required", 400),
    );
  }


  const user = new User({ name, email, password, role });
  await user.save();

  return ok(res, { message: "User registered successfully", user });
});

module.exports = signUp;
