const express = require("express");
const router = express.Router();
const {
  createReg,
  deleteReg,
  getRegById,
  getAllregs,
} = require("../controller/registrationController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/", requireAuth, getAllregs);
router.get("/:id", requireAuth, getRegById);
router.post("/", createReg);
router.delete("/:id", requireAuth, requireRole("admin"), deleteReg);

module.exports = router;
