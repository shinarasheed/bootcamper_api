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

  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },

  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
});

// Static method to get avg of tutition of courses for a bootcamp
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log("calculating avg cost....".blue);
  const avgArray = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },

    {
      $group: { _id: "$bootcamp", getAverageCost: { $avg: "$tuition" } },
    },
  ]);

  console.log(avgArray);

  //put average cost into the database
  //this is simple
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(avgArray[0].AverageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

//Call getAverageCost after save course is saved
CourseSchema.post("save", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

// recalculate getAverageCost before course is removed
CourseSchema.pre("remove", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
