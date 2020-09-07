const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcryptjs
//before the user is saved, hash the password
//this method is actually quiet dope
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("user", UserSchema);
