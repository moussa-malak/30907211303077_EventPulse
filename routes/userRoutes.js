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


router.use(requireAuth);
router.use(requireRole);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.use(userValidator);

module.exports = router;