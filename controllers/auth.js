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

  //create token

  // the methods are called on the user not User. a static is called on User
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
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

  // the methods are called on the user not User. a static is called on User
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
});
