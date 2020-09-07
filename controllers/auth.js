const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

//@desc  Register user
//@route  GET /api/v1/auth/register
//@acess  Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //create user
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
