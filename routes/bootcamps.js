const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBookcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const { protect } = require("../middleware/auth");

const Bootcamp = require("../models/Bootcamp");

const advancedResults = require("../middleware/advancedResults");

//include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

//Re-route into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBookcampsInRadius);

//route for file upload
router.route("/:id/photo").put(protect, bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, updateBootcamp)
  .delete(protect, deleteBootcamp);

module.exports = router;
