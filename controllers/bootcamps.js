const Bootcamp = require("../models/Bookcamp");
const Bookcamp = require("../models/Bookcamp");

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps
//@acess  Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ sucess: true, msg: "show all bootcamps" });
};

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps/:id
//@acess  Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ sucess: true, msg: " get a bootcamp" });
};

//@desc   Create new bootcamp
//@route  POST /api/v1/bootcamps
//@acess  Private
exports.createBootcamp = async (req, res, next) => {
  const bootcamp = await Bookcamp.create(req.body);

  //since we are creating a resource we send a status of 201
  res.status(201).json({ sucess: true, data: bootcamp });
};

//@desc   Update bootcamp
//@route  PUT /api/v1/bootcamps/:id
//@acess  Private
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ sucess: true, msg: " update a bootcamp" });
};

//@desc   Delete bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@acess  Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ sucess: true, msg: " delete a bootcamp" });
};
