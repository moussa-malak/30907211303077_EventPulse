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

router.use(requireAuth);

router.get("/", getAllCategories);
router.get("/:id", getCategoryByid);
router.post("/",requireRole("admin"),createCategory);
router.delete("/:id",requireRole("admin"),deleteCategory);
router.put("/:id", requireRole("admin") ,updateCategory);

module.exports = router;