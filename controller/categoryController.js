const express = require("express");
const router = express.Router();
const categoryValidator = require("../middleware/validator/categoryValidator");
const categoryController = require("../controller/categoryController");
const category = require("../models/categoryModule");
const asyncHandeller = require("../middleware/asyncHandler");
const ok = require("../utils/ok");
const appError = require("../utils/appError");

const getAllCategories = asyncHandeller(async (req, res, next) => {
  const {
    page: pageQ,
    limit: limitQ,
    sortBy,
    order,
    search,
    fields,
  } = req.query;

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const page = Math.max(1, parseInt(pageQ) || 1);
  const limit = Math.min(50, parseInt(limitQ) || 10);
  const skip = (page - 1) * limit;
  const allowedFields = ["name", "description"];
  const allowedSortFields = ["name", "description", "createdAt"];
  let selectStr = "-__v";
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  if (fields) {
    const requested = fields
      .split(",")
      .map((f) => f.trim())
      .filter((f) => allowedFields.includes(f));

    if (requested.length > 0) selectStr = requested.join(" ");
  }

  const [categoryList] = await Promise.all([
    category
      .find(filter)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select(selectStr)
      .lean(),
    category.countDocuments(filter),
  ]);

  return ok(res, categoryList, "this is list of all categories ", 200);
});

///////////////////////////////////////////
const getCategoryByid = asyncHandeller(async (req, res, next) => {
  const id = req.params.id;
  const categoryDoc = await category.findById(id);

  if (!categoryDoc) {
    return next(new appError("category not found", 404));
  }

  return ok(res, categoryDoc, "this is the category you want", 200);
});

////////////////////////////////////////////
const createCategory = asyncHandeller(async (req, res, next) => {
  const { name, description } = req.body;
  const categories = await category.create({ name, description });
  return ok(res, categories, "the category created successfully", 201);
});

////////////////////////////////
const updateCategory = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const categoryDoc = await category.findById(id);

  if (!categoryDoc) {
    return next(new appError("category not found", 404));
  }

  Object.assign(categoryDoc, req.body);
  await categoryDoc.save();
  return ok(res, categoryDoc, "category updated successfully", 200);
});

///////////////////////////////////////////////////
const deleteCategory = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const categoryDoc = await category.findById(id);

  if (!categoryDoc) {
    return next(new appError("category is not found", 404));
  }

  await category.findByIdAndDelete(id);
  return ok(res, categoryDoc, "category is deleted sucessfully", 200);
});

module.exports = {
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryByid,
  createCategory,
};
