const Bootcamp = require('../models/Bootcamp');

const ErrorResponse = require('../utils/errorResponse');

// Get All Bootcamps
exports.getBootcamps = async (req, res, next) => {
  let query;

  //copy req.query

  const reqQuery = { ...req.query };

  console.log(reqQuery);

  const removeFileds = ['select', 'sort', 'page', 'limit'];

  removeFileds.forEach((field) => delete reqQuery[field]);

  console.log('after :===', reqQuery);

  // Convert req.query object to JSON
  let queryStr = JSON.stringify(reqQuery);

  // Replace
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Convert queryStr to Object
  query = Bootcamp.find(JSON.parse(queryStr));

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
    query = query.sort('createdAt');
  }

  // Pagination
  // Page number bydefault page no is 1
  const page = parseInt(req.query.page, 10) || 1;

  // Show Bydefault 10 documents per page
  const limit = parseInt(req.query.limit, 10) || 10;

  // const skip = (page - 1) * limit;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing Query
  const bootcamps = await query;

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

  res.status(200).json({
    success: true,
    total,
    count: bootcamps.length,
    pagination,
    data: bootcamps,
  });
};

// Get Single Bootcamp
exports.getBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );
  res.status(200).json({ success: true, data: bootcamp });
};

// Create a new Bootcamp
exports.createBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
};

// Update an existing Bootcamp
exports.updateBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
};

// Delete an existing Bootcamp
exports.deleteBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, msg: `Bootcamp Deleted` });
};
