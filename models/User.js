const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please add a name"],
  },

  email: {
    type: String,
    required: [true, "please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },

  role: {
    type: String,
    enum: ["user", "publisher"],
    default: "user",
  },

  password: {
    type: String,
    required: [true, "please add a password"],
    minlength: 6,
    //this will not return the password when we return the user
    select: false,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  //we can put googleId here too
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcryptjs
//before the user is saved, hash the password
//this method is actually quiet dope
//I WIll be using this method
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate the token
//the id is what we want to encode
//encode unique fields.
//I believe I can just encode emails
//we can encoding the _id into the an id property
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//match user entered password with hashed password
UserSchema.methods.matchPassword = async function (enterendPassword) {
  return await bcrypt.compare(enterendPassword, this.password);
  //this refers to the user document
  //methods are called on the documents and statics on the Model itself
};

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //generate the token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hash token and set to reset password token field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
};

module.exports = mongoose.model("user", UserSchema);
