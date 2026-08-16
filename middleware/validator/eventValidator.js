const { body } = require("express-validator");

const eventValidator = [
  body(["name", "title"])
    .custom((value, { req }) => {
      const candidate = value ?? req.body?.title ?? req.body?.name;
      return !!candidate && String(candidate).trim().length > 0;
    })
    .withMessage("Event name is required"),

  body("date").notEmpty().withMessage("Event date is required"),

  body(["location", "place"])
    .custom((value, { req }) => {
      const candidate = value ?? req.body?.place ?? req.body?.location;
      return !!candidate && String(candidate).trim().length > 0;
    })
    .withMessage("Event location is required"),

  body(["description", "summary"])
    .custom((value, { req }) => {
      const candidate = value ?? req.body?.summary ?? req.body?.description;
      return !!candidate && String(candidate).trim().length > 0;
    })
    .withMessage("Event description is required"),

  body("capacity")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Event capacity must be a positive integer"),

  body("category")
    .optional({ nullable: true })
    .notEmpty()
    .withMessage("Category is required"),

  body(["ticketPrice", "price"])
    .custom((value, { req }) => {
      const candidate = value ?? req.body?.price ?? req.body?.ticketPrice;
      return (
        candidate !== undefined &&
        candidate !== null &&
        candidate !== "" &&
        Number(candidate) >= 0
      );
    })
    .withMessage("Ticket price is required and must be a valid number"),
];

module.exports = eventValidator;
