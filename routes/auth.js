const express = require("express");
const { register, login } = require("../controllers/auth");

const router = express.Router();

//this is different from what we do in the other routes
router.post("/register", register);
router.post("/login", login);

module.exports = router;
