const express = require("express");
const {
  register,
  login,
  getMe,
  getAll,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

//this is different from what we do in the other routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/all", protect, getAll);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
