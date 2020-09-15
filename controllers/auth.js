const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc  Register user
//@route  POST /api/v1/auth/register
//@acess  Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //create user
  //we are not checking if the user aready exist here
  //we already said the name must be unique in the User Model
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//@desc  Login user
//@route  POST /api/v1/auth/login
//@acess  Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email and password because this is not like the registration part
  if (!email || !password) {
    return next(new ErrorResponse("Please provide a password and email", 400));
  }

  // Check for user
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //check if passwords matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

//INSTEAD OF JUST SENDING A TOKEN. WE ARE NOW SENDING A COOKIE WITH A TOKEN IN IT
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};

//THIS IS THE ROUTE WE HIT EVERYTIME OUR APP LOADS

//@desc  Get current logged in user
//@route  POST /api/v1/auth/me
//@acess  Private

//I AM TIRED OF THE ASSYNCHANDLER AND ERRORRESPONSE
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

//@desc  Get all users
//@route  GET /api/v1/auth/me
//@acess  Private

//THIS IS FOR ME
exports.getAll = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, count: users.length, data: users });
});
