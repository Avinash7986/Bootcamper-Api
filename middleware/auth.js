const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect Routes
exports.protect = async (req, res, next) => {
  let token;

  // console.log('Request', req.headers);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If it in cookies
  // else if(req.cookies.token){
  //   token = req.cookies.token;
  // }

  if (!token) {
    return next(new ErrorResponse('Not Authorize to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new ErrorResponse('Not  authorize to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse('Not  authorize to access this route', 403)
      );
    }

    next();
  };
};
