const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");
const { findByIdAndUpdate } = require("../models/Course");

//@desc   Get courses
//@route  GET /api/v1/courses
//@route  GET /api/v1/bootcamps/:bootcampId/courses
//@acess  Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    //since this only returns the bootcamp id we can add
    //more data by populate
    //we can return all the bootcamp data or a select few

    // query = Course.find().populate("bootcamp");

    query = Course.find().populate({
      path: "bootcamp",
      select: "name description",
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

//@desc   Get a single courses
//@route  GET /api/v1/courses/:id
//@acess  Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc   POST add a course
//@route  POST /api/v1/bootcamps/:bootcampId/courses
//@acess  Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  //create a new course
  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc   Update a course
//@route  PUT /api/v1/courses/:id
//@acess  Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  // why do this line. why not just jump to  findByIdAndUpdate()
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  //update course
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc   Delete a course
//@route  DELETE /api/v1/courses/:id
//@acess  Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(
        `No course with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  //delete course
  // await course.remove();
  //remove() is now deprecated

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
