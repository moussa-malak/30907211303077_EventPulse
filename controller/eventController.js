const express = require("express");
const router = express.Router();
const Event = require("../models/eventModules");
const asyncHandler = require("../utils/asyncHandler");
const eventvalidator = require("../middleware/validator/eventValidator");
const AppError = require("../utils/appError");

const createEvent = asyncHandler(async (req, res, next) => {
  const { name, description, date, location, category, ticketPrice, capacity } =
    req.body;
  const userId = req.user?._id || req.user?.id;
  if (userId) req.body.createdBy = userId;

  const event = await Event.create(req.body);
  const populatedEvent = await Event.findById(event._1d).populate("category");

  return res.status(201).json(populatedEvent);
});
/////////////////////////////////////////////////
const getAllEvents = asyncHandler(async (req, res, next) => {
  const {
    category,
    city,
    ticketPriceMin,
    ticketPriceMax,
    capacityMin,
    capacityMax,
    dateFrom,
    dateTo,
    page: pageQ,
    limit: limitQ,
    sort,
    order,
    search,
    fields,
  } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (city) filter.location = { $regex: city, $options: "i" };

  // numeric range filters
  if (ticketPriceMin || ticketPriceMax) {
    filter.ticketPrice = {};
    if (ticketPriceMin) filter.ticketPrice.$gte = Number(ticketPriceMin);
    if (ticketPriceMax) filter.ticketPrice.$lte = Number(ticketPriceMax);
  }

  if (capacityMin || capacityMax) {
    filter.capacity = {};
    if (capacityMin) filter.capacity.$gte = Number(capacityMin);
    if (capacityMax) filter.capacity.$lte = Number(capacityMax);
  }

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  const page = Math.max(1, parseInt(pageQ) || 1);
  const limit = Math.min(50, parseInt(limitQ) || 10);
  const skip = (page - 1) * limit;

  const allowedFields = [
    "name",
    "description",
    "category",
    "date",
    "location",
    "available",
  ];
  const allowedSortFields = [
    "name",
    "category",
    "date",
    "location",
    "createdAt",
  ];
  let selectStr = "-__v";
  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? 1 : -1;

  if (fields) {
    const requested = fields
      .split(",")
      .map((f) => f.trim())
      .filter((f) => allowedFields.includes(f));

    if (requested.length > 0) selectStr = requested.join(" ");
  }
  const totalCount = await Event.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / limit);
  const eventsList = await Event.find(filter)
    .populate("category")
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit)
    .select(selectStr)
    .lean();

  return res.status(200).json(eventsList);
});
////////////////////////////////////////////
const getEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const eventById = await Event.findById(id).populate("category");
  if (!eventById) {
    return next(new AppError("Event not found", 404));
  }
  return res.status(200).json(eventById);
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

  const populatedEvent = await Event.findById(eventDoc._id).populate(
    "category",
  );

  return res.status(200).json(populatedEvent);
});
////////////////////////////////////////////////
const deleteEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedEvent = await Event.findByIdAndDelete(id).populate("category");
  if (!deletedEvent) {
    return next(new AppError("Event not found", 404));
  }
  return res.status(200).json(deletedEvent);
});

router.get("/", getAllEvents);
router.post("/", eventvalidator, createEvent);
router.get("/:id", getEventById);
router.put("/:id", eventvalidator, editEvent);
router.delete("/:id", deleteEventById);

const exported = router;
exported.router = router;
exported.editEvent = editEvent;
exported.deleteEventById = deleteEventById;
exported.getEventById = getEventById;
exported.getAllEvents = getAllEvents;
exported.createEvent = createEvent;

module.exports = exported;
