const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

exports.getSingleUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.status(200).json(user);
});
