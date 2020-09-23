const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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

//@desc   Log out user / clear cokkie
//@route  POST /api/v1/auth/log
//@acess  Private

//THIS WORKS BY CLEARING THE COOKIE
//WHEN WE HAVE OUR TOKEN IN A COKKIE
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
});

//@desc  Get current logged in user
//@route  POST /api/v1/auth/me
//@acess  Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

//@desc  Forgot password
//@route  POST /api/v1/auth/forgotpassword
//@acess  Private

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  //Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are recieving this request because you requested for a password reset. please make a request to: \n ${resetUrl} to reset your password
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: "true", data: "Email sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, data: user });
});

exports.getAll = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.updateDetails = asyncHandler(async (req, res, next) => {
  //these are the only field we want a user to be able to update
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  //get the user with his password. password is select false in our model
  const user = await User.findById(req.user.id).select("+password");

  //check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);

  if (!isMatch) {
    return next(new ErrorResponse("your current password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc  Reset password
//@route  PUT /api/v1/auth/resetpassword/:resettoken
//@acess  Private

//THIS IS SO EASY TO IMPLEMENT ON FRONTEND
//CREATE RESET PASSWORD SCREEN
//WITH route like baseURl/resetpassword/:resettoken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  //find the user by resetPasswordToken
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  //set new password
  //set the user password to the password they are sending
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  //send the token to log them in
  sendTokenResponse(user, 200, res);
});

//INSTEAD OF JUST SENDING A TOKEN. WE ARE NOW SENDING A COOKIE WITH A TOKEN IN IT
// Get token from model, create cookie and send response

//WHY SEND THE TOKEN IN A COOKIE
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

  //we can decide to use the token in th cookie on the client side
  //or just use the token being sent in res.json()
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
