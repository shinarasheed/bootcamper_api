const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

//@desc   Get Reviews
//@route  GET /api/v1/reviews
//@route  GET /api/v1/bootcamps/:bootcampId/reviews
//@acess  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  //this will get the reviews for a bootcamp
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });

    //else get ll reviews
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc   Get single review
//@route  GET /api/v1/reviews/:review
//@acess  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 400)
    );
  }

  res.status(200).json({ success: true, data: review });
});

//@desc   Add review
//@route  POST /api/v1/bootcamps/:bootcampId/reviews
//@acess  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp does not exist", 404));
  }

  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
});

//@desc   Update Review
//@route  PUT /api/v1/reviews/:review
//@acess  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  //make sure he/she owns review or is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

//@desc   DELETE Review
//@route  DELETE /api/v1/reviews/:review
//@acess  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  //make sure he/she owns review or is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized", 401));
  }

  // await review.remove();
  await Review.deleteOne(review);

  res.status(200).json({ success: true, data: {} });
});
