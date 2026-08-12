const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const messageController = require("../controller/messageController");

router.use(express.json());
router.use(requireAuth);

router.get("/:eventId", messageController.getMessagesByEvent);
router.post("/", requireRole("admin"), messageController.createAnnouncement);

module.exports = router;
