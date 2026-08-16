const express = require("express");
const router = express.Router();
const userController = require("../controller/usersController");
const getAllUsers = userController.getAllUsers;
const getUserById = userController.getUserById;
const updateUser = userController.updateUser;
const deleteUser = userController.deleteUser;
const userValidator = require("../middleware/validator/userValidator");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
router.use(express.json());

router.get("/", requireAuth, getAllUsers);
router.get("/:id", requireAuth, getUserById);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  userValidator,
  updateUser,
);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

module.exports = router;
