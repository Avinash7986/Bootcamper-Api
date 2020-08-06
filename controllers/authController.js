const User = require('../models/User');

exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  res.status(200).json({ success: true, data: user });
};
