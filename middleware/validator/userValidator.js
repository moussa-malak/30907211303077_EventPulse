const body = require("express-validator").body;
const uservalidator = [
    body("name")
        .notEmpty()
        .withMessage("Name is required"),
    body("email")
        .isEmail()
        .withMessage("Please provide a valid email"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    body("role")
        .notEmpty()
        .withMessage("Role is required")
];
module.exports = uservalidator;