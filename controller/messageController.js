const mongoose = require("mongoose");
const Message = require("../models/massegeModules");
const Event = require("../models/eventModules");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const ok = require("../utils/ok");

const createAnnouncement = asyncHandler(async (req, res, next) => {
  const senderId = req.user?.id || req.user?._id;
  const { eventId: bodyEventId, event: bodyEvent, content } = req.body || {};
  const eventId = bodyEventId || bodyEvent;
  const io = req.app.get("io");

  if (!senderId) {
    return next(new AppError("Unauthorized", 401));
  }
  if (!eventId || content == null) {
    return next(new AppError("eventId and content are required", 400));
  }
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new AppError("Invalid eventId", 400));
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
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return next(new AppError("Invalid eventId", 400));
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("Event not found", 404));
  }
  const messages = await Message.find({ event: eventId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  if (messages.length === 0) {
    return next(new AppError("no message for this event now", 404));
  }

  return ok(res, messages, "Event announcements retrieved successfully");
});

module.exports = {
  createAnnouncement,
  getMessagesByEvent,
};
