const body = require('express-validator').body;
const eventValidator =
body('eventName')
  .notEmpty()
        .withMessage('Event name is required')
body('date')
  .notEmpty()
        .withMessage('Event date is required')
body('location')
  .notEmpty()
        .withMessage('Event location is required')
body('description')
  .notEmpty()
    .withMessage('Event description is required')
body('capacity')
  .notEmpty()
    .withMessage('Event capacity is required')
  .isInt({ min: 1 })
    .withMessage('Event capacity must be a positive integer');
body("category")
    .notEmpty()
    .withMessage("category is required")
    .isMongoId()
  .withMessage("category must be a valid MongoDB ObjectId");
body("ticketPrice")
  .notEmpty()
  .withMessage("ticket price is required")

module.exports = eventValidator;