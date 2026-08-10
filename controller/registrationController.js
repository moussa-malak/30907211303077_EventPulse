const registration = require("../models/registrationModule");
const Event = require("../models/eventModules");
const asyncHandeller = require("../middleware/asyncHandler");
const ok = require("../utils/ok");
const AppError = require("../utils/appError");

const getUserId = (req) => req.user?.id || req.user?._id;

const getAllregs = asyncHandeller(async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) return next(new AppError("Unauthorized", 401));

  const {
    page: pageQ,
    limit: limitQ,
    sortBy,
    order,
    search,
    fields,
  } = req.query;
  const filter = { user: userId };
  if (search) filter["event.name"] = { $regex: search, $options: "i" };

  const page = Math.max(1, parseInt(pageQ) || 1);
  const limit = Math.min(50, parseInt(limitQ) || 10);
  const skip = (page - 1) * limit;
  const allowedFields = ["event", "user", "createdAt"];
  const allowedSortFields = ["createdAt"];
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

  const [registrations, total] = await Promise.all([
    registration
      .find(filter)
      .populate("event")
      .populate("user")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select(selectStr)
      .lean(),
    registration.countDocuments(filter),
  ]);

  ok(res, registrations, "Current user registrations retrieved successfully", {
    events: registrations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});
////////////////////////////////////////////////////////////
const getRegById = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const userId = getUserId(req);
  if (!userId) return next(new AppError("Unauthorized", 401));

  const populatedReg = await registration
    .findOne({ _id: id, user: userId })
    .populate("event user");

  if (!populatedReg) {
    return next(new AppError("registration not found", 404));
  }
  return ok(res, populatedReg, "registration found");
});
/////////////////////////////////////////////////////////////
const deleteReg = asyncHandeller(async (req, res, next) => {
  const { id } = req.params;
  const userId = getUserId(req);
  if (!userId) return next(new AppError("Unauthorized", 401));

  const deletedReg = await registration
    .findOneAndDelete({ _id: id, user: userId })
    .populate("event user");

  if (!deletedReg) {
    return next(new AppError("registration not found", 404));
  }

  await Event.findByIdAndUpdate(deletedReg.event, {
    $inc: { registeredCount: -1 },
  });

  return ok(res, deletedReg, "Registration canceled successfully");
});
////////////////////////////////////////////////////////////////
const createReg = asyncHandeller(async (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) return next(new AppError("Unauthorized", 401));

  const { event } = req.body;

  const existingEvent = await Event.findById(event);
  if (!existingEvent) {
    return next(new AppError("Event not found", 404));
  }

  const duplicate = await registration.findOne({ user: userId, event });
  if (duplicate) {
    return next(new AppError("Duplicate registration is always rejected", 400));
  }

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: event, registeredCount: { $lt: existingEvent.capacity } },
    { $inc: { registeredCount: 1 } },
    { new: true },
  );

  if (!updatedEvent) {
    return next(new AppError("New registration blocked: event is full", 400));
  }

  const reg = await registration.create({ event, user: userId });
  const populatedReg = await registration
    .findById(reg._id)
    .populate("event user");
  ok(res, populatedReg, "The registration created successfully");
});
///////////////////////////////////////////////////////////////
module.exports = {
  createReg,
  deleteReg,
  getRegById,
  getAllregs,
};
