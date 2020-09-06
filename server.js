const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");

//load env variables
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

const app = express();

//body parser
app.use(express.json());

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//File upload
app.use(fileupload());

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

//error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server and exit process
  server.close(() => process.exit(1));
});
