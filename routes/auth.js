const express = require("express");
const { register, login, getMe } = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

//this is different from what we do in the other routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
