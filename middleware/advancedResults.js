const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  //copy req.query

  const reqQuery = { ...req.query };

  // console.log(reqQuery);

  const removeFileds = ['select', 'sort', 'page', 'limit'];

  removeFileds.forEach((field) => delete reqQuery[field]);

  // console.log('after :===', reqQuery);

  // Convert req.query object to JSON
  let queryStr = JSON.stringify(reqQuery);

  // Replace
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Convert queryStr to Object and finding resource
  query = model.find(JSON.parse(queryStr));

  // Select some fields
  if (req.query.select) {
    const select = req.query.select.split(',').join(' ');
    query = query.select(select);
  }

  // Sort Fields
  if (req.query.sort) {
    const sort = req.query.sort.split(',').join(' ');
    query = query.sort(sort);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  // Page number bydefault page no is 1
  const page = parseInt(req.query.page, 10) || 1;

  // Show Bydefault 10 documents per page
  const limit = parseInt(req.query.limit, 10) || 10;

  // const skip = (page - 1) * limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //   Populate other resources
  if (populate) {
    query = query.populate(populate);
  }

  // Executing Query
  const results = await query;

  // Pagination Result
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
