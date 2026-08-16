const express = require("express");
const router = express.Router();
const {
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryByid,
  createCategory,
} = require("../controller/categoryController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/", getAllCategories);
router.get("/:id", getCategoryByid);
router.post("/", requireAuth, requireRole("admin"), createCategory);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCategory);
router.put("/:id", requireAuth, requireRole("admin"), updateCategory);

module.exports = router;
