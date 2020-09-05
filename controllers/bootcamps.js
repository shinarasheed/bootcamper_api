const Bootcamp = require("../models/Bookcamp");
const ErrorResponse = require("../utils/errorResponse");

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps
//@acess  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bookcamps = await Bootcamp.find();
    res
      .status(200)
      .json({ sucess: true, count: bookcamps.length, data: bookcamps });
  } catch (err) {
    //but this is mostly a server error
    next(err);
  }
};

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps/:id
//@acess  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      //if it a properly formated object id but the bootcamp is not in the database
      return next(err);
    }

    res.status(200).json({ sucess: true, data: bootcamp });
  } catch (err) {
    //if it is not a properly formated object id
    next(err);
  }
};

//@desc   Create new bootcamp
//@route  POST /api/v1/bootcamps
//@acess  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ sucess: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc   Update bootcamp
//@route  PUT /api/v1/bootcamps/:id
//@acess  Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bootcamp) {
      return next(err);
    }
    res.status(200).json({ sucess: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc   Delete bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@acess  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return next(err);
    }
    res.status(200).json({ sucess: true, data: {} });
  } catch (err) {
    next(err);
  }
};
