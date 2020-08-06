const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');

exports.getCourses = async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).json({
    success: true,
    data: courses,
  });
};

exports.getCourse = async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`Course not found with ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
};

exports.updateCourse = async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
};

exports.deleteCourse = async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course with id ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    msg: 'Course Deleted',
  });
};
