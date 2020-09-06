const advancedResults = (model, populate) => async (req, res, next) => {
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
  query = model.find(JSON.parse(queryStr));

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
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  //executing query
  const results = await query;

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

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
