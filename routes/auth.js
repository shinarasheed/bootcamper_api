const express = require("express");
const {
  register,
  login,
  getMe,
  getAll,
  forgotPassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

//this is different from what we do in the other routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.get("/all", protect, getAll);

module.exports = router;
