const Bootcamp = require('../models/Bootcamp');
const path = require('path');

const ErrorResponse = require('../utils/errorResponse');

// Get All Bootcamps
exports.getBootcamps = async (req, res, next) => {
  res.status(200).json(res.advancedResults);
  // let query;

  // //copy req.query

  // const reqQuery = { ...req.query };

  // // console.log(reqQuery);

  // const removeFileds = ['select', 'sort', 'page', 'limit'];

  // removeFileds.forEach((field) => delete reqQuery[field]);

  // // console.log('after :===', reqQuery);

  // // Convert req.query object to JSON
  // let queryStr = JSON.stringify(reqQuery);

  // // Replace
  // queryStr = queryStr.replace(
  //   /\b(gt|gte|lt|lte|in)\b/g,
  //   (match) => `$${match}`
  // );

  // // Convert queryStr to Object
  // query = Bootcamp.find(JSON.parse(queryStr)).populate({
  //   path: 'courses',
  //   select: 'title',
  // });

  // // Select some fields
  // if (req.query.select) {
  //   const select = req.query.select.split(',').join(' ');
  //   query = query.select(select);
  // }

  // // Sort Fields
  // if (req.query.sort) {
  //   const sort = req.query.sort.split(',').join(' ');
  //   query = query.sort(sort);
  // } else {
  //   query = query.sort('createdAt');
  // }

  // // Pagination
  // // Page number bydefault page no is 1
  // const page = parseInt(req.query.page, 10) || 1;

  // // Show Bydefault 10 documents per page
  // const limit = parseInt(req.query.limit, 10) || 10;

  // // const skip = (page - 1) * limit;
  // const startIndex = (page - 1) * limit;
  // const endIndex = page * limit;
  // const total = await Bootcamp.countDocuments();

  // query = query.skip(startIndex).limit(limit);

  // // Executing Query
  // const bootcamps = await query;

  // // Pagination Result
  // const pagination = {};
  // if (endIndex < total) {
  //   pagination.next = {
  //     page: page + 1,
  //     limit,
  //   };
  // }

  // if (startIndex > 0) {
  //   pagination.prev = {
  //     page: page - 1,
  //     limit,
  //   };
  // }

  // res.status(200).json({
  //   success: true,
  //   total,
  //   count: bootcamps.length,
  //   pagination,
  //   data: bootcamps,
  // });
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
  // Add Logged in user id

  // console.log(req.user.id);
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If user is not an admin, then can only add one bootcamp

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('User has already Published a bootcamp', 400)
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
};

// Update an existing Bootcamp
exports.updateBootcamp = async (req, res, next) => {
  // Only publisher of bootcamp and admin can update

  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );

  // console.log('Bootcamp id', typeof bootcamp.user);
  // console.log('User id', typeof req.user.id);

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorize to update this bootcamp`, 401)
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
};

// Delete an existing Bootcamp
exports.deleteBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp)
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorize to update this bootcamp`, 401)
    );
  }

  //  remove middleware
  bootcamp.remove();
  res.status(200).json({ success: true, msg: `Bootcamp Deleted` });
};

exports.uploadPhoto = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User is not authorize to update this bootcamp`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  const file = req.files.file;

  // Make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  // Filesize must be less than 1mb
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorResponse(`Image size must be less than 1Mb`, 400));
  }

  // create custom file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // Moving file to upload directory
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
};
