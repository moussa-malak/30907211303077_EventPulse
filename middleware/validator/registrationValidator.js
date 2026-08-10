const body = require("express-validator").body;

const registrationValidator = [
  body("event")
    .notEmpty()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),
];

module.exports = registrationValidator;
