const express = require("express");
const router = express.Router();
const signup = require("../controller/signUpController");

router.post("/", signup);

module.exports = router;