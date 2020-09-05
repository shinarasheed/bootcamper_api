const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },

  description: {
    type: String,
    required: [true, "please add a description"],
  },

  weeks: {
    type: String,
    required: [true, "please add a number of weeks"],
  },

  tuition: {
    type: Number,
    required: [true, "please add a tuition cost"],
  },

  minimumSkill: {
    type: String,
    required: [true, "please add a minimum skill"],
    emum: ["beginner", "intermediate", "advance"],
  },

  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  //a course belongs to a particular bootcamp
  //so we must reference the bootcamp collection

  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

module.exports = mongoose.model("course", CourseSchema);
