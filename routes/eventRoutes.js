const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.use(requireAuth);
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/",requireRole("admin"),eventController.createEvent);
router.put("/:id",requireRole("admin"), eventController.editEvent);
router.delete("/:id",requireRole("admin"),eventController.deleteEventById);

module.exports = router;