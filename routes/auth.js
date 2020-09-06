const express = require("express");
const { register } = require("../controllers/auth");

const router = express.Router();

//this is different from what we do in the other routes
router.post("/register", register);

module.exports = router;
