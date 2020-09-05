const Bootcamp = require("../models/Bookcamp");

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps
//@acess  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bookcamps = await Bootcamp.find();
    res
      .status(200)
      .json({ sucess: true, count: bookcamps.length, data: bookcamps });
  } catch (error) {
    //but this is mostly a server error
    res.status(400).json({ sucess: false });
  }
};

//@desc   Get all bootcamps
//@route  GET /api/v1/bootcamps/:id
//@acess  Public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ sucess: false });
    }

    res.status(200).json({ sucess: true, data: bootcamp });
  } catch (error) {
    // res.status(500).json({ sucess: false });
    next(error);
  }
};

//@desc   Create new bootcamp
//@route  POST /api/v1/bootcamps
//@acess  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ sucess: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false });
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
      return res.status(400).json({ sucess: false });
    }
    res.status(200).json({ sucess: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false });
  }
};

//@desc   Delete bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@acess  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ sucess: false });
    }
    res.status(200).json({ sucess: true, data: {} });
  } catch (error) {
    res.status(400).json({ sucess: false });
  }
};
