const Message = require("../models/massegeModules");
const Event = require("../models/eventModules");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const ok = require("../utils/ok");
const io = require("socket.io");

const createAnnouncement = asyncHandler(async (req, res, next) => {
  const senderId = req.user?.id || req.user?._id;
  const { eventId, content } = req.body;

  if (!senderId) {
    return next(new AppError("Unauthorized", 401));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  const message = await Message.create({
    sender: senderId,
    event: eventId,
    content,
  });

  // const io = req.app.get("io");
  if (io) {
    io.to(eventId.toString()).emit("announcement", {
      event: eventId,
      sender: senderId,
      content,
      createdAt: message.createdAt,
    });
  }

  return ok(res, message, "Announcement created and delivered");
});

const getMessagesByEvent = asyncHandler(async (req, res, next) => {
  const attendeeId = req.user?.id || req.user?._id;
  const { eventId } = req.params;

  if (!attendeeId) {
    return next(new AppError("Unauthorized", 401));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }

  const messages = await Message.find({ event: eventId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  return ok(res, messages, "Event announcements retrieved successfully");
});

module.exports = {
  createAnnouncement,
  getMessagesByEvent,
};
