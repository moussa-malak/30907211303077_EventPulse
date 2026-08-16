const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    ticketPrice: {
      type: Number,
      default: 0,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Event", eventSchema);
