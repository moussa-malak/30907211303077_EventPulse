const express = require("express");
const router = express.Router();
const eventController = require("../controller/eventController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  eventController.editEvent,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  eventController.deleteEventById,
);

module.exports = router;
