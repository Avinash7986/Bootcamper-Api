const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendMail');

exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, 200, res);
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  // Check for password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendTokenResponse(user, 200, res);
};

exports.getMe = async (req, res, next) => {
  // console.log(req.user);
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

exports.forgotPassword = async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorResponse(`Please Provide your email`, 400));
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(
        `There is no user exist with email ${req.body.email}`,
        404
      )
    );
  }

  // Reset Token

  const resetToken = await user.getResetPasswordToken();

  // console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // Create ResetURl

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl} `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email Sent' });
  } catch (error) {
    console.log(error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email Could not Send', 500));
  }
};

exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
};

exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!req.body.currentPassword || !req.body.newPassword) {
    return next(new ErrorResponse('Please Provide Password', 400));
  }

  // Check current Password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is Incorrect', 401));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendTokenResponse(user, 200, res);
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create Token
  const token = user.getSignedJwtToken();

  const options = {
    // 30days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
