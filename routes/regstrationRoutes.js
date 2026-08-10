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

router.use(requireAuth);
router.get("/", getAllregs);
router.get("/:id", getRegById);
router.post("/",requireRole("admin") , createReg);
router.delete("/:id",requireRole("admin"), deleteReg);

module.exports = router;
