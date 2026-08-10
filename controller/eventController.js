const express = require("express");
const router = express.Router();
const Event = require("../models/eventModules");
const asyncHandler = require("../utils/asyncHandler");
const eventvalidator = require("../middleware/validator/eventValidator");
const ok = require("../utils/ok");
const AppError = require("../utils/appError");

const createEvent = asyncHandler(async (req, res, next) => {
  const { name, description, date, location, category, capacity } = req.body;
  const userId = req.user?._id || req.user?.id;

  const newEvent = await Event.create({
    name,
    description,
    date,
    location,
    category,
    capacity,
    ...(userId ? { createdBy: userId } : {}),
  });

  return ok(res, newEvent, "Event created successfully");
});
/////////////////////////////////////////////////
const getAllEvents = asyncHandler(async (req, res, next) => {
  const {
    category,
    page: pageQ,
    limit: limitQ,
    sortBy,
    order,
    search,
    fields,
  } = req.query;
  const filter = {};
  const userId = req.user?._id || req.user?.id;

  if (userId) filter.createdBy = userId;
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };

  const page = Math.max(1, parseInt(pageQ) || 1);
  const limit = Math.min(50, parseInt(limitQ) || 10);
  const skip = (page - 1) * limit;

  const allowedFields = ["name", "category", "date", "location", "available"];
  const allowedSortFields = [
    "name",
    "category",
    "date",
    "location",
    "createdAt",
  ];
  let selectStr = "-__v";
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  if (fields) {
    const requested = fields
      .split(",")
      .map((f) => f.trim())
      .filter((f) => allowedFields.includes(f));

    if (requested.length > 0) selectStr = requested.join(" ");
  }

  const [eventsList, total] = await Promise.all([
    Event.find(filter)
      .populate("category")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select(selectStr)
      .lean(),
    Event.countDocuments(filter),
  ]);

  return ok(res, eventsList, "Events retrieved successfully", {
    events: eventsList,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});
////////////////////////////////////////////
const getEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const eventById = await Event.findById(id).populate("category");
  if (!eventById) {
    return next(new AppError("Event not found", 404));
  }
  return ok(res, eventById, "Event found");
});
/////////////////////////////////////////////
const editEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const eventDoc = await Event.findById(id);
  if (!eventDoc) {
    return next(new AppError("Event not found", 404));
  }
  Object.assign(eventDoc, req.body);
  await eventDoc.save();
  return ok(res, eventDoc, "Event updated successfully");
});
////////////////////////////////////////////////
const deleteEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    return next(new AppError("Event not found", 404));
  }
  return ok(res, deletedEvent, "Event deleted successfully");
});

router.get("/", getAllEvents);
router.post("/", eventvalidator, createEvent);
router.get("/:id", getEventById);
router.put("/:id", eventvalidator, editEvent);
router.delete("/:id", deleteEventById);

module.exports = {
  router,
  editEvent,
  deleteEventById,
  getEventById,
  getAllEvents,
  createEvent,
};
