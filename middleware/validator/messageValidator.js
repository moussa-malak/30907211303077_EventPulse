const body = require("express-validator").body;

const messageValidator = [
  body("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),
  body("content')
    .notEmpty()
    .withMessage('Message content is required'),
module.exports = messageValidator;
