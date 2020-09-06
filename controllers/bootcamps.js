const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps
//@acess  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  //Field to exclude

  const removeFields = ["select", "sort", "page", "limit"];

  //loop over removeFields and delete them from reqQuery

  removeFields.forEach((param) => delete reqQuery[param]);

  //create query string
  let queryStr = JSON.stringify(reqQuery);

  //create operators
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //finding resource
  query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  //SELECT FIELDS
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);

    //why not just map through the array of bootacamps on the frontend and return a new
    //array containing only the names
  }

  //sort

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    //descending order by createdAt
    query = query.sort("-createdAt");
  }

  //pagination
  //page 1 by default
  const page = parseInt(req.query.page, 10) || 1;

  //limit is the number we want to show per page
  const limit = parseInt(req.query.limit, 10) || 25;

  //the number to skip/ leave behind

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // countDocuments; is a mongoose method to count all documents
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //executing query
  const bookcamps = await query;

  //pagination result

  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    sucess: true,
    count: bookcamps.length,
    pagination: pagination,
    data: bookcamps,
  });
});

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps/:id
//@acess  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    //if it a properly formated object id but the bootcamp is not in the database
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ sucess: true, data: bootcamp });
});

//@desc   Create new bootcamp
//@route  POST /api/v1/bootcamps
//@acess  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ sucess: true, data: bootcamp });
});

//@desc   Update bootcamp
//@route  PUT /api/v1/bootcamps/:id
//@acess  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ sucess: true, data: bootcamp });
});

//@desc   Delete bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@acess  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //we could have just used findByIdAndDelete
  //we did this because of the cascade thing we are doing in the bootcamp model
  bootcamp.remove();

  res.status(200).json({ sucess: true, data: {} });
});

//@desc   Get bootcamps within a radius
//@route  DELETE /api/v1/bootcamps/radius/:zipcode/:distance
//@acess  Private
exports.getBookcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //calc radius using radians
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ sucess: true, count: bootcamps.length, data: bootcamps });
});

//@desc   Upload photo for bootcamp
//@route  PUT /api/v1/bootcamps/:id/photo
//@acess  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //if no file is selected
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file `, 404));
  }

  const file = req.files.file;

  //make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file `, 400));
  }

  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} `,
        400
      )
    );
  }

  //rename the file name to a custom name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      sucess: true,
      data: file.name,
    });
  });
});
