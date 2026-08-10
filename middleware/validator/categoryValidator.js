const body = require("express-validator").body;

const categoryValidator = [
    body("name")
        .notEmpty()
        .withMessage("Name is required"),
    body("description")
        .notEmpty()
        .withMessage("Description is required")
];

module.exports = categoryValidator;