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

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log("calculating avergae cost...".blue);

  const avgArray = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },

    {
      $group: { _id: "$bootcamp", getAverageCost: { $avg: "$tuition" } },
    },
  ]);

  //put average cost into the database
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      AverageCost: Math.ceil(avgArray[0].AverageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

//Call getAverageCost after save
CourseSchema.post("save", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

//Call getAverageCost before save
CourseSchema.pre("remove", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("course", CourseSchema);
