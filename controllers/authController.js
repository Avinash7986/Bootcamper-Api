const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

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

exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};
