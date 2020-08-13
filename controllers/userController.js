const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.getUsers = async (req, res, next) => {
  res.status(200).json(res.advancedResults);
};

exports.getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

exports.createUser = async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
};

exports.updateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

exports.deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: 'User Deleted',
  });
};
