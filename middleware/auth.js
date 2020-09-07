const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//protect routes

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //covert the req.headers.authorization value into an array and pick the second element
    token = req.headers.authorization.split(" ")[1];
  }
  //   else if (req.cookies.token) {
  //     token = req.cookies.token;
  //   }

  //make sure token exists
  if (!token) {
    // return next(new ErrorResponse("Access denied. No token provided", 401));
    return res.status(401).json({ success: false, msg: "No token" });
  }

  //verify token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user will be a object id
    //and this will always be the login user
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    // return next(new ErrorResponse("Invalid token", 400));
    return res.status(400).json({ success: false, msg: "Invalid token" });
  }
});
